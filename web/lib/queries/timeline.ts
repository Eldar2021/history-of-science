import { unstable_cache } from "next/cache";
import type { Locale } from "@/lib/i18n/formatYear";
import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { fixtureDisciplines, fixtureEras, fixtureTimeline } from "@/lib/fixtures/timeline";
import { FALLBACK_REVALIDATE_SECONDS, TIMELINE_TAG } from "@/lib/cache-tags";
import type { Discipline, Era, TimelineEvent } from "./types";

const cacheOptions = { tags: [TIMELINE_TAG], revalidate: FALLBACK_REVALIDATE_SECONDS };

// Public reads go through the anon client (RLS as a visitor) and the tagged data cache;
// the admin save action calls updateTag(TIMELINE_TAG) so the site changes on the next request.

const fetchTimeline = unstable_cache(
  async (locale: Locale): Promise<TimelineEvent[]> => {
    const { data, error } = await createAnonClient().rpc("get_timeline", { p_locale: locale });
    if (error) throw new Error(`get_timeline failed: ${error.message}`);
    return (data ?? []) as TimelineEvent[];
  },
  ["timeline"],
  cacheOptions,
);

const fetchEras = unstable_cache(
  async (locale: Locale): Promise<Era[]> => {
    const { data, error } = await createAnonClient()
      .from("eras")
      .select("id, slug, start_year, end_year, sort_order, era_translations!inner(name, tagline, locale)")
      .eq("era_translations.locale", locale)
      .order("sort_order");
    if (error) throw new Error(`eras failed: ${error.message}`);
    return (data ?? []).map((r) => {
      const tr = (r.era_translations as unknown as Array<{ name: string; tagline: string | null }>)[0];
      return { id: r.id, slug: r.slug, start_year: r.start_year, end_year: r.end_year, name: tr?.name ?? r.slug, tagline: tr?.tagline ?? null };
    });
  },
  ["eras"],
  cacheOptions,
);

const fetchDisciplines = unstable_cache(
  async (locale: Locale): Promise<Discipline[]> => {
    const { data, error } = await createAnonClient()
      .from("disciplines")
      .select("id, slug, discipline_translations!inner(name, locale)")
      .eq("discipline_translations.locale", locale)
      .order("id");
    if (error) throw new Error(`disciplines failed: ${error.message}`);
    return (data ?? []).map((r) => {
      const tr = (r.discipline_translations as unknown as Array<{ name: string }>)[0];
      return { id: r.id, slug: r.slug, name: tr?.name ?? r.slug };
    });
  },
  ["disciplines"],
  cacheOptions,
);

export const getTimeline = (locale: Locale) => (hasSupabaseEnv() ? fetchTimeline(locale) : Promise.resolve(fixtureTimeline(locale)));
export const getEras = (locale: Locale) => (hasSupabaseEnv() ? fetchEras(locale) : Promise.resolve(fixtureEras(locale)));
export const getDisciplines = (locale: Locale) => (hasSupabaseEnv() ? fetchDisciplines(locale) : Promise.resolve(fixtureDisciplines(locale)));

import { cache } from "react";
import type { Locale } from "@/lib/i18n/formatYear";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { fixtureEras, fixtureTimeline } from "@/lib/fixtures/timeline";
import type { Era, TimelineEvent } from "./types";

export const getTimeline = cache(async (locale: Locale): Promise<TimelineEvent[]> => {
  if (!hasSupabaseEnv()) return fixtureTimeline(locale);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_timeline", { p_locale: locale });
  if (error) throw new Error(`get_timeline failed: ${error.message}`);
  return (data ?? []) as TimelineEvent[];
});

export const getEras = cache(async (locale: Locale): Promise<Era[]> => {
  if (!hasSupabaseEnv()) return fixtureEras(locale);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eras")
    .select("id, slug, start_year, end_year, sort_order, era_translations!inner(name, tagline, locale)")
    .eq("era_translations.locale", locale)
    .order("sort_order");
  if (error) throw new Error(`eras failed: ${error.message}`);
  return (data ?? []).map((r) => {
    const tr = (r.era_translations as unknown as Array<{ name: string; tagline: string | null }>)[0];
    return { id: r.id, slug: r.slug, start_year: r.start_year, end_year: r.end_year, name: tr?.name ?? r.slug, tagline: tr?.tagline ?? null };
  });
});

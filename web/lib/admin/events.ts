import "server-only";
import { cache } from "react";
import { locales, type Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { TranslationStatus } from "@/lib/queries/types";
import {
  emptyEventForm, emptyNames,
  type ContentStatus, type EventFormValues, type Precision, type SourceKind, type TranslationValues,
} from "./eventForm";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type TranslationRow = Database["public"]["Tables"]["event_translations"]["Row"];

export type AdminEventListItem = {
  id: string;
  slug: string;
  year: number;
  year_end: number | null;
  precision: Precision;
  status: ContentStatus;
  drafted_by: "human" | "ai";
  importance: number;
  source_locale: Locale;
  deleted_at: string | null;
  updated_at: string;
  title: string;
  /** locale → translation status; absent when that language does not exist yet. */
  languages: Partial<Record<Locale, TranslationStatus>>;
};

export type ListFilter = "all" | ContentStatus | "deleted";
export const SORTS = ["year", "updated", "title"] as const;
export type ListSort = (typeof SORTS)[number];

export type ListQuery = {
  filter: ListFilter;
  /** Free text over title and slug. */
  q?: string;
  /** Only events with no translation in this language. */
  missing?: Locale;
  sort?: ListSort;
};

/**
 * Staff see every row through RLS (is_staff). Search, the missing-language filter and sorting happen
 * in memory: the whole table is a few dozen rows, and the title being searched lives in a joined
 * table. Move this into SQL if the list ever outgrows a single page of results.
 */
export const listAdminEvents = cache(async (query: ListQuery, uiLocale: Locale): Promise<AdminEventListItem[]> => {
  const supabase = await createClient();
  let q = supabase
    .from("events")
    .select("id, slug, year, year_end, precision, status, drafted_by, importance, source_locale, deleted_at, updated_at, event_translations(locale, title, status)")
    .order("year");
  if (query.filter === "deleted") q = q.not("deleted_at", "is", null);
  else {
    q = q.is("deleted_at", null);
    if (query.filter !== "all") q = q.eq("status", query.filter);
  }
  const { data, error } = await q;
  if (error) throw new Error(`admin events failed: ${error.message}`);

  // Searching before mapping: the needle may match a title in a language the list will not show.
  const needle = query.q?.trim().toLocaleLowerCase();
  const rows = (data ?? []).filter((r) => {
    const trs = r.event_translations as Array<Pick<TranslationRow, "locale" | "title" | "status">>;
    if (query.missing && trs.some((t) => t.locale === query.missing)) return false;
    if (!needle) return true;
    return r.slug.includes(needle) || trs.some((t) => t.title.toLocaleLowerCase().includes(needle));
  });

  const items: AdminEventListItem[] = rows.map((r) => {
    const trs = r.event_translations as Array<Pick<TranslationRow, "locale" | "title" | "status">>;
    const pick = trs.find((t) => t.locale === uiLocale) ?? trs.find((t) => t.locale === r.source_locale) ?? trs[0];
    const languages: AdminEventListItem["languages"] = {};
    trs.forEach((t) => { languages[t.locale] = t.status; });
    return {
      id: r.id, slug: r.slug, year: r.year, year_end: r.year_end, precision: r.precision,
      status: r.status, drafted_by: r.drafted_by, importance: r.importance, source_locale: r.source_locale,
      deleted_at: r.deleted_at, updated_at: r.updated_at,
      title: pick?.title ?? r.slug,
      languages,
    };
  });

  const sort = query.sort ?? "year";
  if (sort === "updated") items.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  else if (sort === "title") items.sort((a, b) => a.title.localeCompare(b.title, uiLocale));
  return items;
});

export type AdminStats = {
  byStatus: Record<ContentStatus, number>;
  deleted: number;
  /** locale → how many live events have no translation in it. */
  missing: Record<Locale, number>;
  recent: Array<{ id: string; title: string; updated_at: string; status: ContentStatus }>;
};

/** The numbers the dashboard opens with. One query; the arithmetic is cheap at this size. */
export const getAdminStats = cache(async (uiLocale: Locale): Promise<AdminStats> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, slug, status, source_locale, deleted_at, updated_at, event_translations(locale, title)");
  if (error) throw new Error(`admin stats failed: ${error.message}`);

  const byStatus: AdminStats["byStatus"] = { draft: 0, review: 0, published: 0 };
  const missing: AdminStats["missing"] = { en: 0, ru: 0, ky: 0, tr: 0 };
  let deleted = 0;
  const live: Array<{ id: string; title: string; updated_at: string; status: ContentStatus }> = [];

  for (const r of data ?? []) {
    if (r.deleted_at) { deleted += 1; continue; }
    byStatus[r.status] += 1;
    const trs = r.event_translations as Array<{ locale: Locale; title: string }>;
    for (const l of locales) if (!trs.some((t) => t.locale === l)) missing[l] += 1;
    const pick = trs.find((t) => t.locale === uiLocale) ?? trs.find((t) => t.locale === r.source_locale) ?? trs[0];
    live.push({ id: r.id, title: pick?.title ?? r.slug, updated_at: r.updated_at, status: r.status });
  }
  live.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  return { byStatus, deleted, missing, recent: live.slice(0, 5) };
});

/** slug + title of every live event, for the "builds on" picker. */
export const listEventOptions = cache(async (uiLocale: Locale): Promise<Array<{ slug: string; year: number; title: string }>> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("slug, year, source_locale, event_translations(locale, title)")
    .is("deleted_at", null)
    .order("year");
  if (error) throw new Error(`event options failed: ${error.message}`);
  return (data ?? []).map((r) => {
    const trs = r.event_translations as Array<{ locale: Locale; title: string }>;
    const pick = trs.find((t) => t.locale === uiLocale) ?? trs.find((t) => t.locale === r.source_locale) ?? trs[0];
    return { slug: r.slug, year: r.year, title: pick?.title ?? r.slug };
  });
});

export type AdminEvent = {
  row: EventRow;
  translations: Partial<Record<Locale, TranslationRow>>;
  disciplines: string[];
  sources: Array<{ title: string; url: string | null; kind: string | null }>;
  people: Array<{ slug: string; role: string | null; birth_year: number | null; death_year: number | null; names: Partial<Record<Locale, string>> }>;
  builds_on: Array<{ slug: string; note: string | null }>;
};

export const getAdminEvent = cache(async (id: string): Promise<AdminEvent | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_translations(*), event_disciplines(disciplines(slug)), sources(title, url, kind), event_people(role, people(slug, birth_year, death_year, person_translations(locale, name)))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`admin event failed: ${error.message}`);
  if (!data) return null;
  const { event_translations, event_disciplines, sources, event_people, ...row } = data;

  const translations: AdminEvent["translations"] = {};
  (event_translations as TranslationRow[]).forEach((t) => { translations[t.locale] = t; });

  const disciplines = (event_disciplines as Array<{ disciplines: { slug: string } | null }>)
    .map((d) => d.disciplines?.slug)
    .filter((s): s is string => Boolean(s));

  const people = (event_people as Array<{
    role: string | null;
    people: { slug: string; birth_year: number | null; death_year: number | null; person_translations: Array<{ locale: Locale; name: string }> } | null;
  }>)
    .filter((p) => p.people)
    .map((p) => {
      const names: Partial<Record<Locale, string>> = {};
      p.people!.person_translations.forEach((t) => { names[t.locale] = t.name; });
      return { slug: p.people!.slug, role: p.role, birth_year: p.people!.birth_year, death_year: p.people!.death_year, names };
    })
    .sort((a, b) => (a.birth_year ?? 9999) - (b.birth_year ?? 9999));

  // Two FKs point at events from event_links, so the target slug is a second, unambiguous query.
  const { data: linkRows } = await supabase
    .from("event_links")
    .select("to_event_id, note")
    .eq("from_event_id", id)
    .eq("type", "builds_on");
  const targetIds = (linkRows ?? []).map((l) => l.to_event_id);
  const slugById = new Map<string, string>();
  if (targetIds.length) {
    const { data: targets } = await supabase.from("events").select("id, slug").in("id", targetIds);
    (targets ?? []).forEach((t) => slugById.set(t.id, t.slug));
  }
  const builds_on = (linkRows ?? [])
    .map((l) => ({ slug: slugById.get(l.to_event_id) ?? "", note: l.note }))
    .filter((l) => l.slug);

  return {
    row: row as EventRow,
    translations,
    disciplines,
    sources: (sources as Array<{ title: string; url: string | null; kind: string | null }>) ?? [],
    people,
    builds_on,
  };
});

/** DB rows → form values. Every language at once; the form edits them together (ADR-034). */
export function toFormValues(event: AdminEvent, openLocale?: Locale): EventFormValues {
  const { row } = event;
  const base = emptyEventForm(row.source_locale);
  const translations = { ...base.translations };
  for (const l of locales) {
    const tr = event.translations[l];
    if (!tr) continue;
    translations[l] = {
      title: tr.title ?? "",
      summary: tr.summary ?? "",
      body: tr.body ?? "",
      why_it_matters: tr.why_it_matters ?? "",
      if_you_were_there: tr.if_you_were_there ?? "",
      place_name: tr.place_name ?? "",
    } satisfies TranslationValues;
  }

  return {
    ...base,
    id: row.id,
    slug: row.slug,
    year: String(row.year),
    year_end: row.year_end === null ? "" : String(row.year_end),
    precision: row.precision,
    importance: String(row.importance),
    lat: row.lat === null ? "" : String(row.lat),
    lng: row.lng === null ? "" : String(row.lng),
    place_precision: row.place_precision,
    image_path: row.image_path ?? "",
    image_credit: row.image_credit ?? "",
    image_license: row.image_license ?? "",
    image_source_url: row.image_source_url ?? "",
    status: row.status,
    source_locale: row.source_locale,
    edit_locale: openLocale ?? row.source_locale,
    translations,
    disciplines: event.disciplines,
    sources: event.sources.map((s) => ({
      title: s.title,
      url: s.url ?? "",
      kind: ((s.kind ?? "encyclopedia") as SourceKind),
    })),
    people: event.people.map((p) => ({
      slug: p.slug,
      role: p.role ?? "",
      birth_year: p.birth_year === null ? "" : String(p.birth_year),
      death_year: p.death_year === null ? "" : String(p.death_year),
      names: { ...emptyNames(), ...p.names },
    })),
    builds_on: event.builds_on.map((l) => ({ slug: l.slug, note: l.note ?? "" })),
  };
}

import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { TranslationStatus } from "@/lib/queries/types";
import type { ContentStatus, EventFormValues, Precision } from "./eventForm";

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

/** Staff see every row through RLS (is_staff). Sorted by year, deleted rows only on request. */
export const listAdminEvents = cache(async (filter: ListFilter, uiLocale: Locale): Promise<AdminEventListItem[]> => {
  const supabase = await createClient();
  let q = supabase
    .from("events")
    .select("id, slug, year, year_end, precision, status, drafted_by, importance, source_locale, deleted_at, updated_at, event_translations(locale, title, status)")
    .order("year");
  if (filter === "deleted") q = q.not("deleted_at", "is", null);
  else {
    q = q.is("deleted_at", null);
    if (filter !== "all") q = q.eq("status", filter);
  }
  const { data, error } = await q;
  if (error) throw new Error(`admin events failed: ${error.message}`);
  return (data ?? []).map((r) => {
    const trs = r.event_translations as Array<Pick<TranslationRow, "locale" | "title" | "status">>;
    const pick = trs.find((t) => t.locale === uiLocale) ?? trs.find((t) => t.locale === r.source_locale) ?? trs[0];
    const languages: AdminEventListItem["languages"] = {};
    trs.forEach((t) => { languages[t.locale] = t.status; });
    return {
      id: r.id,
      slug: r.slug,
      year: r.year,
      year_end: r.year_end,
      precision: r.precision,
      status: r.status,
      drafted_by: r.drafted_by,
      importance: r.importance,
      source_locale: r.source_locale,
      deleted_at: r.deleted_at,
      updated_at: r.updated_at,
      title: pick?.title ?? r.slug,
      languages,
    };
  });
});

export type AdminEvent = {
  row: EventRow;
  translations: Partial<Record<Locale, TranslationRow>>;
  disciplines: string[];
};

export const getAdminEvent = cache(async (id: string): Promise<AdminEvent | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_translations(*), event_disciplines(disciplines(slug))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`admin event failed: ${error.message}`);
  if (!data) return null;
  const { event_translations, event_disciplines, ...row } = data;
  const translations: AdminEvent["translations"] = {};
  (event_translations as TranslationRow[]).forEach((t) => { translations[t.locale] = t; });
  const disciplines = (event_disciplines as Array<{ disciplines: { slug: string } | null }>)
    .map((d) => d.disciplines?.slug)
    .filter((s): s is string => Boolean(s));
  return { row: row as EventRow, translations, disciplines };
});

/** DB rows → form values for one translation (the requested locale, else the source locale). */
export function toFormValues(event: AdminEvent, editLocale?: Locale): EventFormValues {
  const { row } = event;
  const locale = editLocale ?? row.source_locale;
  const tr = event.translations[locale];
  return {
    id: row.id,
    slug: row.slug,
    year: String(row.year),
    year_end: row.year_end === null ? "" : String(row.year_end),
    precision: row.precision,
    importance: String(row.importance),
    lat: row.lat === null ? "" : String(row.lat),
    lng: row.lng === null ? "" : String(row.lng),
    place_precision: row.place_precision,
    place_name: tr?.place_name ?? "",
    status: row.status,
    source_locale: row.source_locale,
    edit_locale: locale,
    title: tr?.title ?? "",
    summary: tr?.summary ?? "",
    body: tr?.body ?? "",
    why_it_matters: tr?.why_it_matters ?? "",
    if_you_were_there: tr?.if_you_were_there ?? "",
    disciplines: event.disciplines,
  };
}

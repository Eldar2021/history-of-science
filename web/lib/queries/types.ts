import type { Locale, YearPrecision } from "@/lib/i18n/formatYear";
import type { PlacePrecision } from "@/lib/i18n/formatPlace";

export type TranslationStatus = "machine" | "human" | "reviewed";

/** One row of get_timeline(locale). Mirrors backend/supabase/migrations/0001_init.sql and 0003_event_place.sql. */
export type TimelineEvent = {
  id: string;
  slug: string;
  year: number;
  year_end: number | null;
  precision: YearPrecision;
  era_id: number;
  importance: number;
  image_path: string | null;
  /** Where it happened. null whenever place_precision is "unknown" (see ADR-025). */
  lat: number | null;
  lng: number | null;
  place_precision: PlacePrecision;
  /** Bare name, no qualifier; falls back to the source locale. Format with formatPlace. */
  place_name: string | null;
  title: string;
  summary: string;
  translation_status: TranslationStatus;
  locale_used: Locale;
  is_fallback: boolean;
  disciplines: string[];
};

export type Era = { id: number; slug: string; start_year: number; end_year: number | null; name: string; tagline: string | null };

export type Discipline = { id: number; slug: string; name: string };

export type LinkedEvent = { slug: string; year: number; title: string; note: string | null };
export type EventPerson = { slug: string; name: string; role: string | null; birth_year: number | null; death_year: number | null };
export type EventSource = { title: string; url: string | null; kind: string | null };

/** The JSON document of get_event_detail(slug, locale). Mirrors backend/supabase/migrations/0002_event_detail.sql and 0003_event_place.sql. */
export type EventDetail = {
  id: string;
  slug: string;
  year: number;
  year_end: number | null;
  precision: YearPrecision;
  era_id: number | null;
  importance: number;
  source_locale: Locale;
  image_path: string | null;
  image_credit: string | null;
  image_license: string | null;
  image_source_url: string | null;
  /** Where it happened. null whenever place_precision is "unknown" (see ADR-025). */
  lat: number | null;
  lng: number | null;
  place_precision: PlacePrecision;
  /** Bare name, no qualifier; falls back to the source locale. Format with formatPlace. */
  place_name: string | null;
  title: string;
  summary: string;
  body: string | null;
  why_it_matters: string | null;
  if_you_were_there: string | null;
  translation_status: TranslationStatus;
  locale_used: Locale;
  is_fallback: boolean;
  era: { slug: string; name: string } | null;
  disciplines: Array<{ slug: string; name: string }>;
  people: EventPerson[];
  /** Earlier events this one builds on, newest first. */
  builds_on: LinkedEvent[];
  /** Later events that build on this one, oldest first. */
  enabled: LinkedEvent[];
  sources: EventSource[];
};

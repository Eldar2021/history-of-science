import type { Locale, YearPrecision } from "@/lib/i18n/formatYear";

export type TranslationStatus = "machine" | "human" | "reviewed";

/** One row of get_timeline(locale). Mirrors backend/supabase/migrations/0001_init.sql. */
export type TimelineEvent = {
  id: string;
  slug: string;
  year: number;
  year_end: number | null;
  precision: YearPrecision;
  era_id: number;
  importance: number;
  image_path: string | null;
  title: string;
  summary: string;
  translation_status: TranslationStatus;
  locale_used: Locale;
  is_fallback: boolean;
  disciplines: string[];
};

export type Era = { id: number; slug: string; start_year: number; end_year: number | null; name: string; tagline: string | null };

export type Discipline = { id: number; slug: string; name: string };

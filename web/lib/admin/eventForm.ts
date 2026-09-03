import { locales, type Locale } from "@/i18n/routing";
import { SLUG_PATTERN, slugify } from "./slug";

export const PRECISIONS = ["exact", "circa", "decade", "century"] as const;
export const STATUSES = ["draft", "review", "published"] as const;
export type Precision = (typeof PRECISIONS)[number];
export type ContentStatus = (typeof STATUSES)[number];

/** Everything the event editor form carries. One translation at a time. */
export type EventFormValues = {
  id: string | null;
  slug: string;
  year: string;
  year_end: string;
  precision: Precision;
  importance: string;
  status: ContentStatus;
  source_locale: Locale;
  /** The translation being edited; defaults to source_locale. */
  edit_locale: Locale;
  title: string;
  summary: string;
  body: string;
  why_it_matters: string;
  if_you_were_there: string;
  disciplines: string[];
};

export type EventFormErrors = Partial<Record<keyof EventFormValues | "form", string>>;

export type ParsedEvent = {
  id: string | null;
  slug: string;
  year: number;
  year_end: number | null;
  precision: Precision;
  importance: number;
  status: ContentStatus;
  source_locale: Locale;
  edit_locale: Locale;
  translation: { title: string; summary: string; body: string | null; why_it_matters: string | null; if_you_were_there: string | null };
  disciplines: string[];
};

export const TITLE_SOFT_MAX = 80;
export const SUMMARY_SOFT_MAX = 200;

export const emptyEventForm = (sourceLocale: Locale = "en"): EventFormValues => ({
  id: null,
  slug: "",
  year: "",
  year_end: "",
  precision: "exact",
  importance: "3",
  status: "draft",
  source_locale: sourceLocale,
  edit_locale: sourceLocale,
  title: "",
  summary: "",
  body: "",
  why_it_matters: "",
  if_you_were_there: "",
  disciplines: [],
});

type FormLike = { get(name: string): FormDataEntryValue | null; getAll(name: string): FormDataEntryValue[] };

const str = (fd: FormLike, k: string) => String(fd.get(k) ?? "").trim();
const oneOf = <T extends string>(v: string, allowed: readonly T[], fallback: T): T => (allowed as readonly string[]).includes(v) ? (v as T) : fallback;

/** FormData → typed values, no validation. Keeps whatever the user typed so the form can be re-rendered. */
export function readEventForm(fd: FormLike): EventFormValues {
  const id = str(fd, "id");
  return {
    id: id || null,
    slug: str(fd, "slug"),
    year: str(fd, "year"),
    year_end: str(fd, "year_end"),
    precision: oneOf(str(fd, "precision"), PRECISIONS, "exact"),
    importance: str(fd, "importance") || "3",
    status: oneOf(str(fd, "status"), STATUSES, "draft"),
    source_locale: oneOf(str(fd, "source_locale"), locales, "en"),
    edit_locale: oneOf(str(fd, "edit_locale"), locales, "en"),
    title: str(fd, "title"),
    summary: str(fd, "summary"),
    body: str(fd, "body"),
    why_it_matters: str(fd, "why_it_matters"),
    if_you_were_there: str(fd, "if_you_were_there"),
    disciplines: fd.getAll("disciplines").map(String).filter(Boolean),
  };
}

const INT = /^-?\d+$/;

/** Error keys are message ids under admin.events.errors. */
export function validateEventForm(v: EventFormValues): { errors: EventFormErrors; parsed: ParsedEvent | null } {
  const errors: EventFormErrors = {};

  let year = 0;
  if (!INT.test(v.year)) errors.year = "yearRequired";
  else {
    year = Number(v.year);
    if (year === 0) errors.year = "yearZero";
  }

  let year_end: number | null = null;
  if (v.year_end) {
    if (!INT.test(v.year_end)) errors.year_end = "yearEndInvalid";
    else {
      year_end = Number(v.year_end);
      if (year_end === 0) errors.year_end = "yearZero";
      else if (!errors.year && year_end < year) errors.year_end = "yearEndBefore";
    }
  }

  const importance = Number(v.importance);
  if (!Number.isInteger(importance) || importance < 1 || importance > 5) errors.importance = "importanceRange";

  if (!v.title) errors.title = "titleRequired";
  if (!v.summary) errors.summary = "summaryRequired";
  if (v.disciplines.length === 0) errors.disciplines = "disciplineRequired";

  const slug = v.slug || slugify(v.title);
  if (!SLUG_PATTERN.test(slug)) errors.slug = "slugInvalid";

  if (Object.keys(errors).length > 0) return { errors, parsed: null };
  return {
    errors,
    parsed: {
      id: v.id,
      slug,
      year,
      year_end,
      precision: v.precision,
      importance,
      status: v.status,
      source_locale: v.source_locale,
      edit_locale: v.edit_locale,
      translation: {
        title: v.title,
        summary: v.summary,
        body: v.body || null,
        why_it_matters: v.why_it_matters || null,
        if_you_were_there: v.if_you_were_there || null,
      },
      disciplines: v.disciplines,
    },
  };
}

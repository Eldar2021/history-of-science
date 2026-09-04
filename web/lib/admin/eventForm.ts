import { locales, type Locale } from "@/i18n/routing";
import type { PlacePrecision } from "@/lib/i18n/formatPlace";
import { SLUG_PATTERN, slugify } from "./slug";

export const PRECISIONS = ["exact", "circa", "decade", "century"] as const;
export const STATUSES = ["draft", "review", "published"] as const;
export const PLACE_PRECISIONS = ["exact", "city", "region", "continent", "unknown"] as const;
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
  /** Place, as typed. lat/lng stay strings so a half-typed value survives a failed save. */
  lat: string;
  lng: string;
  place_precision: PlacePrecision;
  place_name: string;
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
  lat: number | null;
  lng: number | null;
  place_precision: PlacePrecision;
  status: ContentStatus;
  source_locale: Locale;
  edit_locale: Locale;
  translation: { title: string; summary: string; body: string | null; why_it_matters: string | null; if_you_were_there: string | null; place_name: string | null };
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
  lat: "",
  lng: "",
  place_precision: "unknown",
  place_name: "",
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
    lat: str(fd, "lat"),
    lng: str(fd, "lng"),
    place_precision: oneOf(str(fd, "place_precision"), PLACE_PRECISIONS, "unknown"),
    place_name: str(fd, "place_name"),
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

/** A latitude or longitude within +/- limit, or null when it is not usable. */
function coordinate(raw: string, limit: number): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null;
}

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

  // Mirrors the place_needs_coords constraint in migration 0003: either a place with
  // coordinates, or no place at all. "unknown" wins over anything left in the fields.
  const unknownPlace = v.place_precision === "unknown";
  let lat: number | null = null;
  let lng: number | null = null;
  if (!unknownPlace) {
    // Only the source locale must name the place: the read functions fall back to it, so a
    // translator who has no name for "Frombork" in Kyrgyz can still save the rest.
    if (!v.place_name && v.edit_locale === v.source_locale) errors.place_name = "placeNameRequired";
    lat = coordinate(v.lat, 90);
    lng = coordinate(v.lng, 180);
    if (lat === null) errors.lat = "latInvalid";
    if (lng === null) errors.lng = "lngInvalid";
  }

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
      lat,
      lng,
      place_precision: v.place_precision,
      status: v.status,
      source_locale: v.source_locale,
      edit_locale: v.edit_locale,
      translation: {
        title: v.title,
        summary: v.summary,
        body: v.body || null,
        why_it_matters: v.why_it_matters || null,
        if_you_were_there: v.if_you_were_there || null,
        place_name: unknownPlace ? null : v.place_name || null,
      },
      disciplines: v.disciplines,
    },
  };
}

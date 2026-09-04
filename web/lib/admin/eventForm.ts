import { locales, type Locale } from "@/i18n/routing";
import type { PlacePrecision } from "@/lib/i18n/formatPlace";
import { SLUG_PATTERN, slugify } from "./slug";

export const PRECISIONS = ["exact", "circa", "decade", "century"] as const;
export const STATUSES = ["draft", "review", "published"] as const;
export const PLACE_PRECISIONS = ["exact", "city", "region", "continent", "unknown"] as const;
export const SOURCE_KINDS = ["encyclopedia", "book", "paper", "article", "other"] as const;
export type Precision = (typeof PRECISIONS)[number];
export type ContentStatus = (typeof STATUSES)[number];
export type SourceKind = (typeof SOURCE_KINDS)[number];

/** The text of one event in one language. `place_name` lives here because the name of a place is a word. */
export type TranslationValues = {
  title: string;
  summary: string;
  body: string;
  why_it_matters: string;
  if_you_were_there: string;
  place_name: string;
};

export type SourceValues = { title: string; url: string; kind: SourceKind };
/** A person carries a name in every language; the role is what they did in *this* event. */
export type PersonValues = { slug: string; role: string; birth_year: string; death_year: string; names: Record<Locale, string> };
export type LinkValues = { slug: string; note: string };

/**
 * Everything the event editor carries - all four languages at once (ADR-034). Numbers stay strings so
 * a half-typed value survives a failed save and comes back exactly as it was typed.
 */
export type EventFormValues = {
  id: string | null;
  slug: string;
  year: string;
  year_end: string;
  precision: Precision;
  importance: string;
  lat: string;
  lng: string;
  place_precision: PlacePrecision;
  image_path: string;
  image_credit: string;
  image_license: string;
  image_source_url: string;
  status: ContentStatus;
  source_locale: Locale;
  /** Which language tab is open. Carried through a save so the form comes back where it was. */
  edit_locale: Locale;
  translations: Record<Locale, TranslationValues>;
  disciplines: string[];
  sources: SourceValues[];
  people: PersonValues[];
  builds_on: LinkValues[];
};

/**
 * Error keys are message ids under `admin.events.errors`, keyed by field. A language's own fields are
 * keyed `"<locale>.title"`, which is also how the form knows which tab to mark.
 */
export type EventFormErrors = Partial<Record<string, string>>;

export type ParsedTranslation = {
  locale: Locale;
  title: string;
  summary: string;
  body: string | null;
  why_it_matters: string | null;
  if_you_were_there: string | null;
  place_name: string | null;
};

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
  image_path: string | null;
  image_credit: string | null;
  image_license: string | null;
  image_source_url: string | null;
  status: ContentStatus;
  source_locale: Locale;
  edit_locale: Locale;
  /** Only the languages that actually carry text; an empty language is left alone, never deleted. */
  translations: ParsedTranslation[];
  disciplines: string[];
  sources: Array<{ title: string; url: string | null; kind: SourceKind }>;
  people: Array<{ slug: string; role: string | null; birth_year: number | null; death_year: number | null; names: Partial<Record<Locale, string>> }>;
  builds_on: Array<{ slug: string; note: string | null }>;
};

export const TITLE_SOFT_MAX = 80;
export const SUMMARY_SOFT_MAX = 200;

export const emptyTranslation = (): TranslationValues => ({
  title: "", summary: "", body: "", why_it_matters: "", if_you_were_there: "", place_name: "",
});

const emptyTranslations = (): Record<Locale, TranslationValues> =>
  Object.fromEntries(locales.map((l) => [l, emptyTranslation()])) as Record<Locale, TranslationValues>;

export const emptyNames = (): Record<Locale, string> =>
  Object.fromEntries(locales.map((l) => [l, ""])) as Record<Locale, string>;

export const emptySource = (): SourceValues => ({ title: "", url: "", kind: "encyclopedia" });
export const emptyPerson = (): PersonValues => ({ slug: "", role: "", birth_year: "", death_year: "", names: emptyNames() });
export const emptyLink = (): LinkValues => ({ slug: "", note: "" });

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
  image_path: "",
  image_credit: "",
  image_license: "",
  image_source_url: "",
  status: "draft",
  source_locale: sourceLocale,
  edit_locale: sourceLocale,
  translations: emptyTranslations(),
  disciplines: [],
  sources: [],
  people: [],
  builds_on: [],
});

type FormLike = { get(name: string): FormDataEntryValue | null; getAll(name: string): FormDataEntryValue[] };

const str = (fd: FormLike, k: string) => String(fd.get(k) ?? "").trim();
const list = (fd: FormLike, k: string) => fd.getAll(k).map((v) => String(v).trim());
const oneOf = <T extends string>(v: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(v) ? (v as T) : fallback;

/**
 * FormData → typed values, no validation. Repeating rows (sources, people, links) are read as
 * parallel arrays: every row renders every field, so `getAll` keeps them lined up by position.
 */
export function readEventForm(fd: FormLike): EventFormValues {
  const id = str(fd, "id");
  const translations = emptyTranslations();
  for (const l of locales) {
    translations[l] = {
      title: str(fd, `tr_${l}_title`),
      summary: str(fd, `tr_${l}_summary`),
      body: str(fd, `tr_${l}_body`),
      why_it_matters: str(fd, `tr_${l}_why_it_matters`),
      if_you_were_there: str(fd, `tr_${l}_if_you_were_there`),
      place_name: str(fd, `tr_${l}_place_name`),
    };
  }

  const sourceTitles = list(fd, "source_title");
  const sourceUrls = list(fd, "source_url");
  const sourceKinds = list(fd, "source_kind");
  const sources = sourceTitles.map((title, i) => ({
    title,
    url: sourceUrls[i] ?? "",
    kind: oneOf(sourceKinds[i] ?? "", SOURCE_KINDS, "encyclopedia"),
  }));

  const personSlugs = list(fd, "person_slug");
  const personRoles = list(fd, "person_role");
  const personBirths = list(fd, "person_birth_year");
  const personDeaths = list(fd, "person_death_year");
  const personNames = Object.fromEntries(locales.map((l) => [l, list(fd, `person_name_${l}`)])) as Record<Locale, string[]>;
  const people = personSlugs.map((slug, i) => ({
    slug,
    role: personRoles[i] ?? "",
    birth_year: personBirths[i] ?? "",
    death_year: personDeaths[i] ?? "",
    names: Object.fromEntries(locales.map((l) => [l, personNames[l][i] ?? ""])) as Record<Locale, string>,
  }));

  const linkSlugs = list(fd, "link_slug");
  const linkNotes = list(fd, "link_note");
  const builds_on = linkSlugs.map((slug, i) => ({ slug, note: linkNotes[i] ?? "" }));

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
    image_path: str(fd, "image_path"),
    image_credit: str(fd, "image_credit"),
    image_license: str(fd, "image_license"),
    image_source_url: str(fd, "image_source_url"),
    status: oneOf(str(fd, "status"), STATUSES, "draft"),
    source_locale: oneOf(str(fd, "source_locale"), locales, "en"),
    edit_locale: oneOf(str(fd, "edit_locale"), locales, "en"),
    translations,
    disciplines: fd.getAll("disciplines").map(String).filter(Boolean),
    sources,
    people,
    builds_on,
  };
}

const INT = /^-?\d+$/;

/** A latitude or longitude within +/- limit, or null when it is not usable. */
function coordinate(raw: string, limit: number): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null;
}

const hasText = (t: TranslationValues) =>
  Boolean(t.title || t.summary || t.body || t.why_it_matters || t.if_you_were_there || t.place_name);

/** A year that may be left blank; returns null for blank and undefined for "not a year". */
function optionalYear(raw: string): number | null | undefined {
  if (!raw) return null;
  if (!INT.test(raw)) return undefined;
  const n = Number(raw);
  return n === 0 ? undefined : n;
}

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

  // Mirrors place_needs_coords in migration 0003: a place with coordinates, or no place at all.
  const unknownPlace = v.place_precision === "unknown";
  let lat: number | null = null;
  let lng: number | null = null;
  if (!unknownPlace) {
    lat = coordinate(v.lat, 90);
    lng = coordinate(v.lng, 180);
    if (lat === null) errors.lat = "latInvalid";
    if (lng === null) errors.lng = "lngInvalid";
    // Only the source language must name the place: reads fall back to it, so a translator with no
    // Kyrgyz word for "Frombork" can still save everything else.
    if (!v.translations[v.source_locale].place_name) errors[`${v.source_locale}.place_name`] = "placeNameRequired";
  }

  // Mirrors image_needs_credit in migration 0001: a picture we show is a picture we credit.
  const image_path = v.image_path || null;
  if (image_path && !(v.image_credit && v.image_license && v.image_source_url)) errors.image = "imageNeedsCredit";

  const translations: ParsedTranslation[] = [];
  for (const locale of locales) {
    const t = v.translations[locale];
    const required = locale === v.source_locale;
    if (!required && !hasText(t)) continue; // an untouched language is left exactly as it was
    if (!t.title) errors[`${locale}.title`] = "titleRequired";
    if (!t.summary) errors[`${locale}.summary`] = "summaryRequired";
    translations.push({
      locale,
      title: t.title,
      summary: t.summary,
      body: t.body || null,
      why_it_matters: t.why_it_matters || null,
      if_you_were_there: t.if_you_were_there || null,
      place_name: unknownPlace ? null : t.place_name || null,
    });
  }

  if (v.disciplines.length === 0) errors.disciplines = "disciplineRequired";

  const slug = v.slug || slugify(v.translations[v.source_locale].title);
  if (!SLUG_PATTERN.test(slug)) errors.slug = "slugInvalid";

  // A row is empty until something is typed in it; empty rows are dropped, not complained about.
  const sources = v.sources.filter((s) => s.title || s.url);
  if (sources.some((s) => !s.title)) errors.sources = "sourceTitleRequired";
  if (sources.some((s) => s.url && !/^https?:\/\//i.test(s.url))) errors.sources = "sourceUrlInvalid";

  const people: ParsedEvent["people"] = [];
  const seenPeople = new Set<string>();
  for (const p of v.people) {
    const names = Object.fromEntries(locales.filter((l) => p.names[l]).map((l) => [l, p.names[l]])) as Partial<Record<Locale, string>>;
    if (!p.slug && !Object.keys(names).length) continue;
    const sourceName = names[v.source_locale];
    if (!sourceName) { errors.people = "personNameRequired"; continue; }
    const personSlug = p.slug || slugify(sourceName);
    if (!SLUG_PATTERN.test(personSlug)) { errors.people = "personSlugInvalid"; continue; }
    if (seenPeople.has(personSlug)) { errors.people = "personDuplicate"; continue; }
    seenPeople.add(personSlug);
    const birth_year = optionalYear(p.birth_year);
    const death_year = optionalYear(p.death_year);
    if (birth_year === undefined || death_year === undefined) { errors.people = "personYearInvalid"; continue; }
    people.push({ slug: personSlug, role: p.role || null, birth_year, death_year, names });
  }

  const builds_on: ParsedEvent["builds_on"] = [];
  const seenLinks = new Set<string>();
  for (const l of v.builds_on) {
    if (!l.slug) continue;
    if (!SLUG_PATTERN.test(l.slug)) { errors.builds_on = "linkSlugInvalid"; continue; }
    if (l.slug === slug) { errors.builds_on = "linkSelf"; continue; }
    if (seenLinks.has(l.slug)) { errors.builds_on = "linkDuplicate"; continue; }
    seenLinks.add(l.slug);
    builds_on.push({ slug: l.slug, note: l.note || null });
  }

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
      image_path,
      image_credit: image_path ? v.image_credit : null,
      image_license: image_path ? v.image_license : null,
      image_source_url: image_path ? v.image_source_url : null,
      status: v.status,
      source_locale: v.source_locale,
      edit_locale: v.edit_locale,
      translations,
      disciplines: v.disciplines,
      sources: sources.map((s) => ({ title: s.title, url: s.url || null, kind: s.kind })),
      people,
      builds_on,
    },
  };
}

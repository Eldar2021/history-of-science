/**
 * The single place where a location is turned into text. See doc/09 ADR-025.
 *
 * Same shape as formatYear: the name is the large, unchanged part and the
 * uncertainty is a small separate note. The note is never glued onto the name
 * as a suffix or preposition, because that cannot be done correctly in four
 * languages at once - Russian would need the genitive ("окрестности Самарканда")
 * and Turkish a vowel-harmonised suffix on a foreign proper noun ("Orta Asya'da",
 * "Mısır'da"). A separate line is honest in every language and needs no grammar.
 *
 * The note says what we do not know. It is never styled as an error: an
 * unidentified hill in the Punjab is a gap in the record, not a mistake.
 */
import type { Locale } from "./formatYear";

export type PlacePrecision = "exact" | "city" | "region" | "continent" | "unknown";

/** A place split so the UI can set the name large and the caveat small. */
export type PlaceParts = {
  /** The bare place name as stored, e.g. "Samarkand". Null when there is no place at all. */
  value: string | null;
  /** What is not known about it; null when the place is pinned. */
  note: string | null;
};

const NOTES: Record<Exclude<PlacePrecision, "exact" | "city">, Record<Locale, string>> = {
  region: {
    en: "the exact spot is not known",
    tr: "kesin noktası bilinmiyor",
    ru: "точное место неизвестно",
    ky: "так жери белгисиз",
  },
  continent: {
    en: "only the wider region is known",
    tr: "yalnızca genel bölge biliniyor",
    ru: "известна только общая область",
    ky: "жалпы аймагы гана белгилүү",
  },
  unknown: {
    en: "this one has no single place",
    tr: "tek bir yere bağlanamıyor",
    ru: "нет одного определённого места",
    ky: "бир гана жерге байланбайт",
  },
};

export function formatPlaceParts(
  name: string | null | undefined,
  precision: PlacePrecision = "exact",
  locale: Locale = "en",
): PlaceParts {
  if (precision === "unknown") return { value: null, note: NOTES.unknown[locale] };
  if (!name) return { value: null, note: NOTES.unknown[locale] };
  if (precision === "exact" || precision === "city") return { value: name, note: null };
  return { value: name, note: NOTES[precision][locale] };
}

export function joinPlace(parts: PlaceParts): string {
  if (!parts.value) return parts.note ?? "";
  return parts.note ? `${parts.value} (${parts.note})` : parts.value;
}

/** The whole place as one string, for plain-text places: aria labels, page titles. */
export function formatPlace(
  name: string | null | undefined,
  precision: PlacePrecision = "exact",
  locale: Locale = "en",
): string {
  return joinPlace(formatPlaceParts(name, precision, locale));
}

/**
 * How wide the uncertainty is drawn on the globe, in kilometres of radius.
 * exact and city get a pin instead, so they have no circle.
 */
export const PLACE_RADIUS_KM: Record<PlacePrecision, number | null> = {
  exact: null,
  city: null,
  region: 300,
  continent: 1800,
  unknown: null,
};

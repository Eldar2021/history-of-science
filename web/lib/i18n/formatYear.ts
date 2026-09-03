/**
 * The single place where years are turned into text. See doc/06-i18n-stratejisi.md.
 * year: integer, negative = BCE, there is no year 0.
 *
 * The approximation marker is a whole word ("around"), never an abbreviation:
 * the reader is a curious non-scientist, and "c." reads as noise (doc/03 voice).
 * The era marker stays short so the year keeps its size, and carries an
 * expansion (eraNote) that the UI shows as a tooltip and as a one-line legend.
 */
export type YearPrecision = "exact" | "circa" | "decade" | "century";
export type Locale = "en" | "ru" | "ky" | "tr";

/** A year split so the UI can set the number large and the qualifier small. */
export type YearParts = {
  /** "around" — null when the year is not approximate. */
  qualifier: string | null;
  /** The part that carries the number, e.g. "585 BCE". */
  value: string;
  /** Expansion of the era abbreviation inside value; null when there is none. */
  eraNote: string | null;
};

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII"];

/** Spelled out on purpose; an abbreviation would need explaining. */
const CIRCA: Record<Locale, string> = {
  en: "around",
  tr: "yaklaşık",
  ru: "около",
  ky: "болжол менен",
};

/** What the era abbreviation in `value` stands for, shown on hover and in the timeline legend. */
const ERA_NOTE: Record<Locale, { bce: string; ce: string }> = {
  en: { bce: "Before the Common Era", ce: "Common Era" },
  tr: { bce: "Milattan Önce", ce: "Milattan Sonra" },
  ru: { bce: "до нашей эры", ce: "нашей эры" },
  ky: { bce: "биздин заманга чейин", ce: "биздин заман" },
};

function englishOrdinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** Turkish plural suffix for a decade number by vowel harmony of its last spoken part. */
function turkishDecadeSuffix(decade: number): string {
  const tens = decade % 100;
  if (tens === 0) return "'ler"; // yüz → -ler (1900'ler, 300'ler, 1000'ler → bin → -ler)
  const backVowel = [10, 30, 40, 60, 90].includes(tens); // on, otuz, kırk, altmış, doksan
  return backVowel ? "'lar" : "'ler"; // yirmi, elli, yetmiş, seksen → -ler
}

function centuryOf(absYear: number): number {
  return Math.floor((absYear - 1) / 100) + 1;
}

function eraNote(locale: Locale, bce: boolean, showCe: boolean): string | null {
  if (bce) return ERA_NOTE[locale].bce;
  return showCe ? ERA_NOTE[locale].ce : null;
}

/** Year split into a small qualifier and the large number. formatYear() joins the two. */
export function formatYearParts(year: number, precision: YearPrecision = "exact", locale: Locale = "en"): YearParts {
  if (year === 0 || !Number.isInteger(year)) throw new Error(`Invalid year: ${year}`);
  const bce = year < 0;
  const abs = Math.abs(year);

  if (precision === "century") {
    const c = centuryOf(abs);
    const value = (() => {
      switch (locale) {
        case "en": return bce ? `${englishOrdinal(c)} century BCE` : `${englishOrdinal(c)} century`;
        case "tr": return bce ? `MÖ ${c}. yüzyıl` : `${c}. yüzyıl`;
        case "ru": return bce ? `${ROMAN[c]} век до н. э.` : `${ROMAN[c]} век`;
        case "ky": return bce ? `б.з.ч. ${ROMAN[c]} кылым` : `${ROMAN[c]} кылым`;
      }
    })();
    return { qualifier: null, value, eraNote: eraNote(locale, bce, false) };
  }

  if (precision === "decade") {
    const d = Math.floor(abs / 10) * 10;
    const value = (() => {
      switch (locale) {
        case "en": return bce ? `${d}s BCE` : `${d}s`;
        case "tr": return bce ? `MÖ ${d}${turkishDecadeSuffix(d)}` : `${d}${turkishDecadeSuffix(d)}`;
        case "ru": return bce ? `${d}-е до н. э.` : `${d}-е`;
        case "ky": return bce ? `б.з.ч. ${d}-жылдар` : `${d}-жылдар`;
      }
    })();
    return { qualifier: null, value, eraNote: eraNote(locale, bce, false) };
  }

  // CE is only spelled out for the first millennium; after that a bare number is unambiguous.
  const showCe = !bce && abs < 1000;
  const value = (() => {
    switch (locale) {
      case "en": return bce ? `${abs} BCE` : showCe ? `${abs} CE` : `${abs}`;
      case "tr": return bce ? `MÖ ${abs}` : showCe ? `MS ${abs}` : `${abs}`;
      case "ru": return bce ? `${abs} до н. э.` : showCe ? `${abs} н. э.` : `${abs}`;
      case "ky": return bce ? `б.з.ч. ${abs}` : showCe ? `б.з. ${abs}` : `${abs}`;
    }
  })();
  return {
    qualifier: precision === "circa" ? CIRCA[locale] : null,
    value,
    eraNote: eraNote(locale, bce, showCe),
  };
}

/** The whole year as one string, for plain-text places: titles, aria labels, e-mail subjects. */
export function formatYear(year: number, precision: YearPrecision = "exact", locale: Locale = "en"): string {
  return joinYear(formatYearParts(year, precision, locale));
}

export function joinYear(parts: YearParts): string {
  return parts.qualifier ? `${parts.qualifier} ${parts.value}` : parts.value;
}

/** Range like "1925 - 1927" or "MÖ 300 - MÖ 250". Plain hyphen on purpose (doc/06).
 *  An approximate range says "around" once, in front of the whole range. */
export function formatYearRangeParts(
  start: number, end: number | null | undefined, precision: YearPrecision, locale: Locale,
): YearParts {
  const from = formatYearParts(start, precision, locale);
  if (end == null || end === start) return from;
  const to = formatYearParts(end, precision, locale);
  return { qualifier: from.qualifier, value: `${from.value} - ${to.value}`, eraNote: from.eraNote ?? to.eraNote };
}

export function formatYearRange(start: number, end: number | null | undefined, precision: YearPrecision, locale: Locale): string {
  return joinYear(formatYearRangeParts(start, end, precision, locale));
}

/** Number of elapsed years between two years, skipping the non-existent year 0. */
export function yearsBetween(a: number, b: number): number {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const raw = hi - lo;
  return lo < 0 && hi > 0 ? raw - 1 : raw;
}

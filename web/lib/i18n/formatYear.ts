/**
 * The single place where years are turned into text. See doc/06-i18n-stratejisi.md.
 * year: integer, negative = BCE, there is no year 0.
 */
export type YearPrecision = "exact" | "circa" | "decade" | "century";
export type Locale = "en" | "ru" | "ky" | "tr";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII"];

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

export function formatYear(year: number, precision: YearPrecision = "exact", locale: Locale = "en"): string {
  if (year === 0 || !Number.isInteger(year)) throw new Error(`Invalid year: ${year}`);
  const bce = year < 0;
  const abs = Math.abs(year);

  if (precision === "century") {
    const c = centuryOf(abs);
    switch (locale) {
      case "en": return bce ? `${englishOrdinal(c)} century BCE` : `${englishOrdinal(c)} century`;
      case "tr": return bce ? `MÖ ${c}. yüzyıl` : `${c}. yüzyıl`;
      case "ru": return bce ? `${ROMAN[c]} век до н. э.` : `${ROMAN[c]} век`;
      case "ky": return bce ? `б.з.ч. ${ROMAN[c]} кылым` : `${ROMAN[c]} кылым`;
    }
  }

  if (precision === "decade") {
    const d = Math.floor(abs / 10) * 10;
    switch (locale) {
      case "en": return bce ? `${d}s BCE` : `${d}s`;
      case "tr": return bce ? `MÖ ${d}${turkishDecadeSuffix(d)}` : `${d}${turkishDecadeSuffix(d)}`;
      case "ru": return bce ? `${d}-е до н. э.` : `${d}-е`;
      case "ky": return bce ? `б.з.ч. ${d}-жылдар` : `${d}-жылдар`;
    }
  }

  const circa = precision === "circa";
  const showCe = !bce && abs < 1000;
  switch (locale) {
    case "en": {
      const base = bce ? `${abs} BCE` : showCe ? `${abs} CE` : `${abs}`;
      return circa ? `c. ${base}` : base;
    }
    case "tr": {
      const base = bce ? `MÖ ${circa ? "y. " : ""}${abs}` : showCe ? `MS ${circa ? "y. " : ""}${abs}` : `${circa ? "y. " : ""}${abs}`;
      return base;
    }
    case "ru": {
      const base = bce ? `${abs} до н. э.` : showCe ? `${abs} н. э.` : `${abs}`;
      return circa ? `ок. ${base}` : base;
    }
    case "ky": {
      const base = bce ? `б.з.ч. ${abs}` : showCe ? `б.з. ${abs}` : `${abs}`;
      return circa ? `болж. ${base}` : base;
    }
  }
}

/** Range like "1925-1927" or "MÖ 300 - MÖ 250". Plain hyphen on purpose (doc/06). */
export function formatYearRange(start: number, end: number | null | undefined, precision: YearPrecision, locale: Locale): string {
  if (end == null || end === start) return formatYear(start, precision, locale);
  return `${formatYear(start, precision, locale)} - ${formatYear(end, precision, locale)}`;
}

/** Number of elapsed years between two years, skipping the non-existent year 0. */
export function yearsBetween(a: number, b: number): number {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const raw = hi - lo;
  return lo < 0 && hi > 0 ? raw - 1 : raw;
}

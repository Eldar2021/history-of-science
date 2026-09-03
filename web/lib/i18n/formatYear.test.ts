import { describe, expect, it } from "vitest";
import { formatYear, formatYearParts, formatYearRange, formatYearRangeParts, yearsBetween, type Locale, type YearPrecision } from "./formatYear";

// 4 locales × 4 precisions × BCE/CE = 32 cases, from the year table in doc/04-mimari.md
const cases: Array<[number, YearPrecision, Locale, string]> = [
  // exact
  [-585, "exact", "en", "585 BCE"], [1687, "exact", "en", "1687"],
  [-585, "exact", "tr", "MÖ 585"], [1687, "exact", "tr", "1687"],
  [-585, "exact", "ru", "585 до н. э."], [1687, "exact", "ru", "1687"],
  [-585, "exact", "ky", "б.з.ч. 585"], [1687, "exact", "ky", "1687"],
  // circa
  [-300, "circa", "en", "around 300 BCE"], [1600, "circa", "en", "around 1600"],
  [-300, "circa", "tr", "yaklaşık MÖ 300"], [1600, "circa", "tr", "yaklaşık 1600"],
  [-300, "circa", "ru", "около 300 до н. э."], [1600, "circa", "ru", "около 1600"],
  [-300, "circa", "ky", "болжол менен б.з.ч. 300"], [1600, "circa", "ky", "болжол менен 1600"],
  // decade
  [-305, "decade", "en", "300s BCE"], [1834, "decade", "en", "1830s"],
  [-305, "decade", "tr", "MÖ 300'ler"], [1834, "decade", "tr", "1830'lar"],
  [-305, "decade", "ru", "300-е до н. э."], [1834, "decade", "ru", "1830-е"],
  [-305, "decade", "ky", "б.з.ч. 300-жылдар"], [1834, "decade", "ky", "1830-жылдар"],
  // century
  [-450, "century", "en", "5th century BCE"], [1687, "century", "en", "17th century"],
  [-450, "century", "tr", "MÖ 5. yüzyıl"], [1687, "century", "tr", "17. yüzyıl"],
  [-450, "century", "ru", "V век до н. э."], [1687, "century", "ru", "XVII век"],
  [-450, "century", "ky", "б.з.ч. V кылым"], [1687, "century", "ky", "XVII кылым"],
];

describe("formatYear", () => {
  it.each(cases)("%i %s %s → %s", (year, precision, locale, expected) => {
    expect(formatYear(year, precision, locale)).toBe(expected);
  });

  it("labels CE years below 1000", () => {
    expect(formatYear(499, "exact", "en")).toBe("499 CE");
    expect(formatYear(499, "exact", "tr")).toBe("MS 499");
    expect(formatYear(499, "exact", "ru")).toBe("499 н. э.");
    expect(formatYear(499, "exact", "ky")).toBe("б.з. 499");
  });

  it("handles Turkish decade vowel harmony", () => {
    expect(formatYear(1925, "decade", "tr")).toBe("1920'ler");
    expect(formatYear(1955, "decade", "tr")).toBe("1950'ler");
    expect(formatYear(1965, "decade", "tr")).toBe("1960'lar");
    expect(formatYear(1905, "decade", "tr")).toBe("1900'ler");
  });

  it("century boundaries", () => {
    expect(formatYear(1700, "century", "en")).toBe("17th century");
    expect(formatYear(1701, "century", "en")).toBe("18th century");
    expect(formatYear(-100, "century", "en")).toBe("1st century BCE");
    expect(formatYear(-101, "century", "en")).toBe("2nd century BCE");
  });

  it("rejects year 0", () => {
    expect(() => formatYear(0)).toThrow();
  });
});

describe("formatYearRange", () => {
  it("formats ranges with a plain hyphen", () => {
    expect(formatYearRange(1925, 1927, "exact", "en")).toBe("1925 - 1927");
    expect(formatYearRange(-300, -250, "exact", "tr")).toBe("MÖ 300 - MÖ 250");
    expect(formatYearRange(1687, null, "exact", "en")).toBe("1687");
  });
});

describe("formatYearParts", () => {
  it("keeps the approximation word out of the number so the UI can set it smaller", () => {
    expect(formatYearParts(-300, "circa", "en")).toEqual({
      qualifier: "around", value: "300 BCE", eraNote: "Before the Common Era",
    });
    expect(formatYearParts(1687, "exact", "en").qualifier).toBeNull();
  });

  it("explains the era abbreviation in every locale", () => {
    expect(formatYearParts(-585, "exact", "tr").eraNote).toBe("Milattan Önce");
    expect(formatYearParts(-585, "exact", "ru").eraNote).toBe("до нашей эры");
    expect(formatYearParts(-585, "exact", "ky").eraNote).toBe("биздин заманга чейин");
    expect(formatYearParts(499, "exact", "en").eraNote).toBe("Common Era");
  });

  it("has nothing to explain once the year stands alone", () => {
    expect(formatYearParts(1687, "exact", "en").eraNote).toBeNull();
    expect(formatYearParts(1687, "century", "en").eraNote).toBeNull();
  });

  it("says the approximation once for a range", () => {
    expect(formatYearRangeParts(-300, -250, "circa", "en")).toEqual({
      qualifier: "around", value: "300 BCE - 250 BCE", eraNote: "Before the Common Era",
    });
    expect(formatYearRange(-300, -250, "circa", "en")).toBe("around 300 BCE - 250 BCE");
  });
});

describe("yearsBetween", () => {
  it("skips year 0", () => {
    expect(yearsBetween(-1, 1)).toBe(1);
    expect(yearsBetween(-585, 1687)).toBe(2271);
    expect(yearsBetween(160, 499)).toBe(339);
  });
});

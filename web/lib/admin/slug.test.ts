import { describe, expect, it } from "vitest";
import { SLUG_PATTERN, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates English", () => {
    expect(slugify("Newton's Principia (1687)")).toBe("newton-s-principia-1687");
  });
  it("transliterates Turkish letters", () => {
    expect(slugify("Uluğ Bey Gözlemevi Işık")).toBe("ulug-bey-gozlemevi-isik");
  });
  it("transliterates Kyrgyz and Russian Cyrillic", () => {
    expect(slugify("Ңөү жана Ньютон")).toBe("ngou-zhana-nyuton");
    expect(slugify("Аль-Хорезми")).toBe("al-khorezmi");
  });
  it("strips leading and trailing separators and caps the length", () => {
    expect(slugify("  --hello--  ")).toBe("hello");
    expect(slugify("a".repeat(100)).length).toBeLessThanOrEqual(80);
  });
  it("produces slugs that satisfy SLUG_PATTERN", () => {
    for (const s of ["Öklid Elementler", "Ибн Сина", "Zhang Heng's seismoscope"]) expect(slugify(s)).toMatch(SLUG_PATTERN);
    expect("").not.toMatch(SLUG_PATTERN);
    expect("Bad Slug").not.toMatch(SLUG_PATTERN);
  });
});

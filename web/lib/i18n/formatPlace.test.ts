import { describe, expect, it } from "vitest";
import { formatPlace, formatPlaceParts, PLACE_RADIUS_KM, type PlacePrecision } from "./formatPlace";
import type { Locale } from "./formatYear";

const LOCALES: Locale[] = ["en", "tr", "ru", "ky"];

describe("formatPlaceParts", () => {
  it("leaves a pinned place as the bare name, with nothing added", () => {
    for (const p of ["exact", "city"] as PlacePrecision[]) {
      for (const locale of LOCALES) {
        expect(formatPlaceParts("Samarkand", p, locale)).toEqual({ value: "Samarkand", note: null });
      }
    }
  });

  it("keeps the name unchanged and puts the caveat in a separate note", () => {
    // The point of ADR-025: no suffix, no preposition, nothing that would need
    // a Russian genitive or a Turkish vowel-harmonised ending on a foreign name.
    for (const locale of LOCALES) {
      const parts = formatPlaceParts("Punjab", "region", locale);
      expect(parts.value).toBe("Punjab");
      expect(parts.note).toBeTruthy();
      expect(parts.note).not.toContain("Punjab");
    }
  });

  it("has a note in every language for every imprecise level", () => {
    for (const p of ["region", "continent", "unknown"] as PlacePrecision[]) {
      for (const locale of LOCALES) {
        expect(formatPlaceParts("Central Asia", p, locale).note, `${p}/${locale}`).toBeTruthy();
      }
    }
  });

  it("drops the name when there is no single place", () => {
    expect(formatPlaceParts("Somewhere", "unknown", "en").value).toBeNull();
  });

  it("treats a missing name as no place rather than showing an empty label", () => {
    expect(formatPlaceParts(null, "city", "tr")).toEqual(formatPlaceParts(null, "unknown", "tr"));
    expect(formatPlaceParts("", "city", "en").value).toBeNull();
  });
});

describe("formatPlace", () => {
  it("joins name and note for plain-text places", () => {
    expect(formatPlace("Samarkand", "exact", "en")).toBe("Samarkand");
    expect(formatPlace("Punjab", "region", "en")).toBe("Punjab (the exact spot is not known)");
    expect(formatPlace(null, "unknown", "en")).toBe("this one has no single place");
  });

  it("never returns an empty string", () => {
    for (const p of ["exact", "city", "region", "continent", "unknown"] as PlacePrecision[]) {
      for (const locale of LOCALES) {
        expect(formatPlace(null, p, locale)).not.toBe("");
      }
    }
  });
});

describe("PLACE_RADIUS_KM", () => {
  it("draws a circle only where the spot is genuinely unknown", () => {
    expect(PLACE_RADIUS_KM.exact).toBeNull();
    expect(PLACE_RADIUS_KM.city).toBeNull();
    expect(PLACE_RADIUS_KM.unknown).toBeNull();
    expect(PLACE_RADIUS_KM.region!).toBeLessThan(PLACE_RADIUS_KM.continent!);
  });
});

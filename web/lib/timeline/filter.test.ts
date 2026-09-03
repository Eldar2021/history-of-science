import { describe, expect, it } from "vitest";
import { matchesFilter, parseSelected } from "./filter";

const known = new Set(["physics", "astronomy"]);

describe("parseSelected", () => {
  it("reads a comma list", () => {
    expect(Array.from(parseSelected("physics,astronomy", known))).toEqual(["physics", "astronomy"]);
  });
  it("drops unknown and empty entries", () => {
    expect(Array.from(parseSelected("physics,,magic, astronomy ", known))).toEqual(["physics", "astronomy"]);
  });
  it("is empty for null", () => {
    expect(parseSelected(null, known).size).toBe(0);
  });
});

describe("matchesFilter", () => {
  it("matches everything when nothing is selected", () => {
    expect(matchesFilter(new Set(), ["biology"])).toBe(true);
  });
  it("needs one shared discipline", () => {
    expect(matchesFilter(new Set(["physics"]), ["astronomy", "physics"])).toBe(true);
    expect(matchesFilter(new Set(["physics"]), ["biology"])).toBe(false);
  });
});

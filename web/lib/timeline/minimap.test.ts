import { describe, expect, it } from "vitest";
import { closestIndex, densityBins } from "./minimap";
import { TIMELINE_END, TIMELINE_START } from "./xScale";

describe("densityBins", () => {
  it("returns zeros for no events", () => {
    expect(densityBins([], 4)).toEqual([0, 0, 0, 0]);
  });
  it("puts the range ends in the first and last bins and scales to 1", () => {
    const b = densityBins([TIMELINE_START, TIMELINE_END, TIMELINE_END], 10);
    expect(b[0]).toBeCloseTo(Math.sqrt(0.5));
    expect(b[9]).toBe(1);
  });
  it("clamps years outside the range", () => {
    const b = densityBins([-5000, 3000], 5);
    expect(b[0]).toBe(1);
    expect(b[4]).toBe(1);
  });
});

describe("closestIndex", () => {
  it("finds the nearest year, preferring the earlier on ties", () => {
    expect(closestIndex([-585, -300, 1687, 1947], 1700)).toBe(2);
    expect(closestIndex([-585, -300, 1687, 1947], 1817)).toBe(2);
    expect(closestIndex([-585, -300, 1687, 1947], -1000)).toBe(0);
  });
});

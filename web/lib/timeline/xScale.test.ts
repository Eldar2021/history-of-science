import { describe, expect, it } from "vitest";
import {
  TIMELINE_END, TIMELINE_START, clampPan, fromContinuous, minImportanceAt, toContinuous,
  unitToYear, visibleYears, xScale, xScaleInvert, yearToUnit, zoomAround, zoomLevel,
} from "./xScale";
import { yearsBetween } from "@/lib/i18n/formatYear";

describe("continuous axis without year 0", () => {
  it("makes -1 and 1 adjacent", () => {
    expect(toContinuous(1) - toContinuous(-1)).toBe(1);
    expect(toContinuous(-585)).toBe(-584);
    expect(toContinuous(1687)).toBe(1687);
  });
  it("never returns year 0 and round-trips", () => {
    for (const y of [-600, -585, -1, 1, 499, 1687, 2026]) expect(fromContinuous(toContinuous(y))).toBe(y);
    expect(fromContinuous(0)).toBe(-1);
    expect(fromContinuous(0.4)).toBe(-1);
    expect(fromContinuous(0.6)).toBe(1);
  });
  it("agrees with yearsBetween", () => {
    expect(toContinuous(1) - toContinuous(-585)).toBe(yearsBetween(-585, 1));
    expect(toContinuous(2026) - toContinuous(-600)).toBe(yearsBetween(-600, 2026));
  });
});

describe("full-range unit", () => {
  it("maps the ends to 0 and 1", () => {
    expect(yearToUnit(TIMELINE_START)).toBe(0);
    expect(yearToUnit(TIMELINE_END)).toBe(1);
  });
  it("is monotonic and inverts", () => {
    expect(yearToUnit(-585)).toBeLessThan(yearToUnit(-300));
    expect(yearToUnit(1900)).toBeLessThan(yearToUnit(1947));
    for (const y of [-585, -240, 820, 1543, 1687, 1947, 2020]) expect(unitToYear(yearToUnit(y))).toBe(y);
  });
  it("shows how compressed the modern era is", () => {
    // The 20th century is under 5% of the strip; antiquity to 1400 is over three quarters.
    expect(yearToUnit(2000) - yearToUnit(1900)).toBeLessThan(0.05);
    expect(yearToUnit(1400)).toBeGreaterThan(0.75);
  });
});

describe("xScale with zoom and pan", () => {
  it("equals the unit at the full view", () => {
    expect(xScale(1687)).toBeCloseTo(yearToUnit(1687));
    expect(xScale(TIMELINE_START, 1, 0)).toBe(0);
    expect(xScale(TIMELINE_END, 1, 0)).toBe(1);
  });
  it("zoom 2 with pan 0.5 shows the right half", () => {
    const mid = unitToYear(0.5);
    expect(xScale(mid, 2, 0.5)).toBeCloseTo(0);
    expect(xScale(TIMELINE_END, 2, 0.5)).toBeCloseTo(1);
    expect(xScale(TIMELINE_START, 2, 0.5)).toBeLessThan(0);
  });
  it("inverts for any view", () => {
    for (const view of [[1, 0], [2, 0.5], [8, 0.8], [26, 0.9]] as const) {
      for (const y of [1543, 1687, 1947, 2020]) {
        const x = xScale(y, view[0], view[1]);
        expect(xScaleInvert(x, view[0], view[1])).toBe(y);
      }
    }
  });
  it("clamps pan to keep the window inside the range", () => {
    expect(clampPan(-1, 2)).toBe(0);
    expect(clampPan(0.9, 2)).toBeCloseTo(0.5);
    expect(clampPan(0.3, 1)).toBe(0);
  });
});

describe("semantic zoom", () => {
  it("covers the whole range at zoom 1", () => {
    expect(visibleYears(1)).toBe(toContinuous(TIMELINE_END) - toContinuous(TIMELINE_START));
  });
  it("maps window size to Z0..Z3 with matching importance floors", () => {
    expect(zoomLevel(1)).toBe(0);
    expect(zoomLevel(5)).toBe(1); // ~525 years
    expect(zoomLevel(26)).toBe(2); // ~100 years
    expect(zoomLevel(130)).toBe(3); // ~20 years
    expect(minImportanceAt(0)).toBe(5);
    expect(minImportanceAt(3)).toBe(1);
  });
  it("zooms around a point and keeps the year under the cursor", () => {
    const view = { zoom: 1, pan: 0 };
    const x = xScale(1687, view.zoom, view.pan);
    const next = zoomAround(view, 4, x);
    expect(next.zoom).toBe(4);
    expect(xScale(1687, next.zoom, next.pan)).toBeCloseTo(x);
    const back = zoomAround(next, 0.1, x);
    expect(back.zoom).toBe(1);
    expect(back.pan).toBe(0);
  });
});

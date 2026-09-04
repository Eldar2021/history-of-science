import { describe, expect, it } from "vitest";
import { toGlobeEvents } from "./events";
import { nearestByUnit, toRibbonEras, toStripEvents } from "./strip";
import type { Era, TimelineEvent } from "@/lib/queries/types";

const ERAS = new Map([[1, "The Ancient World"]]);

const event = (over: Partial<TimelineEvent> = {}): TimelineEvent => ({
  id: "id", slug: "thales", year: -585, year_end: null, precision: "circa", era_id: 1, importance: 5,
  image_path: null, lat: 37.5306, lng: 27.2778, place_precision: "city", place_name: "Miletus",
  title: "Thales looks for natural causes", summary: "A sentence.", translation_status: "human",
  locale_used: "en", is_fallback: false, disciplines: ["physics", "astronomy"],
  ...over,
});

const era = (over: Partial<Era> = {}): Era => ({
  id: 1, slug: "ancient", start_year: -600, end_year: 500, name: "The Ancient World", tagline: null, ...over,
});

describe("toStripEvents", () => {
  it("keeps every event, including the ones the globe cannot point at", () => {
    const timeline = [
      event({ slug: "thales" }),
      event({ slug: "farming", year: -9000, place_precision: "unknown", lat: null, lng: null, place_name: null }),
      event({ slug: "newton", year: 1687 }),
    ];
    const strip = toStripEvents(timeline, ERAS, toGlobeEvents(timeline, ERAS));
    expect(strip.map((e) => e.slug)).toEqual(["thales", "farming", "newton"]);
    // The globe's list is shorter, so the indices are not the strip's: this is the bridge.
    expect(strip.map((e) => e.globeIndex)).toEqual([0, null, 1]);
  });

  it("carries the place as it is, so an unknown place can still say so on the card", () => {
    const strip = toStripEvents([event({ place_precision: "region", place_name: "Punjab" })], ERAS, []);
    expect(strip[0]).toMatchObject({ placeName: "Punjab", placePrecision: "region", globeIndex: null });
  });

  it("puts events on the time axis in order, clamped to it", () => {
    const strip = toStripEvents(
      [event({ slug: "old", year: -9000 }), event({ slug: "mid", year: 1000 }), event({ slug: "new", year: 2020 })],
      ERAS,
      [],
    );
    expect(strip[0].unit).toBe(0); // before TIMELINE_START, clamped rather than negative
    expect(strip[0].unit).toBeLessThan(strip[1].unit);
    expect(strip[1].unit).toBeLessThan(strip[2].unit);
    expect(strip[2].unit).toBeLessThanOrEqual(1);
  });

  it("survives an era it does not know", () => {
    expect(toStripEvents([event({ era_id: 99 })], ERAS, [])[0].era).toBeNull();
  });
});

describe("toRibbonEras", () => {
  it("turns an era into a band on the axis", () => {
    const [band] = toRibbonEras([era()]);
    expect(band.startUnit).toBe(0);
    expect(band.endUnit).toBeGreaterThan(0);
    expect(band.endUnit).toBeLessThan(1);
  });

  it("runs the last era, which has no end year, to the end of the axis", () => {
    const [band] = toRibbonEras([era({ start_year: 1900, end_year: null })]);
    expect(band.endUnit).toBe(1);
  });

  it("never lets a band end before it starts", () => {
    const [band] = toRibbonEras([era({ start_year: 1900, end_year: 1800 })]);
    expect(band.endUnit).toBe(band.startUnit);
  });
});

describe("nearestByUnit", () => {
  const strip = toStripEvents(
    [event({ slug: "a", year: -500 }), event({ slug: "b", year: 1000 }), event({ slug: "c", year: 2000 })],
    ERAS,
    [],
  );

  it("finds the event under a point on the ribbon", () => {
    expect(nearestByUnit(strip, strip[1].unit + 0.001)).toBe(1);
    expect(nearestByUnit(strip, 0)).toBe(0);
    expect(nearestByUnit(strip, 1)).toBe(2);
  });

  it("says -1 when there is nothing to find", () => {
    expect(nearestByUnit([], 0.5)).toBe(-1);
  });
});

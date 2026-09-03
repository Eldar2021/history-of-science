import { describe, expect, it } from "vitest";
import { toGlobeEvents } from "./events";
import type { TimelineEvent } from "@/lib/queries/types";

const ERAS = new Map([[1, "The Ancient World"]]);

const event = (over: Partial<TimelineEvent> = {}): TimelineEvent => ({
  id: "id", slug: "thales", year: -585, year_end: null, precision: "circa", era_id: 1, importance: 5,
  image_path: null, lat: 37.5306, lng: 27.2778, place_precision: "city", place_name: "Miletus",
  title: "Thales looks for natural causes", summary: "A sentence.", translation_status: "human",
  locale_used: "en", is_fallback: false, disciplines: ["physics", "astronomy"],
  ...over,
});

describe("toGlobeEvents", () => {
  it("keeps a placed event with everything the globe needs to draw it", () => {
    const [e] = toGlobeEvents([event()], ERAS);
    expect(e).toMatchObject({
      slug: "thales", lat: 37.5306, lng: 27.2778, placePrecision: "city",
      placeName: "Miletus", era: "The Ancient World",
    });
  });

  it("leaves out events with no single place", () => {
    expect(toGlobeEvents([event({ place_precision: "unknown", lat: null, lng: null })], ERAS)).toEqual([]);
  });

  it("leaves out a database that has not learnt about places yet", () => {
    // The regression this file exists for: before migration 0003 the RPC has no place columns at
    // all, so they arrive undefined. `!== null` let them through, NaN reached the camera and the
    // globe drew an empty sphere with no way to tell something was wrong.
    const unmigrated = { ...event(), lat: undefined, lng: undefined, place_precision: undefined, place_name: undefined };
    expect(toGlobeEvents([unmigrated as unknown as TimelineEvent], ERAS)).toEqual([]);
  });

  it("refuses coordinates that are not real numbers", () => {
    expect(toGlobeEvents([event({ lat: Number.NaN })], ERAS)).toEqual([]);
    expect(toGlobeEvents([event({ lng: Number.POSITIVE_INFINITY })], ERAS)).toEqual([]);
  });

  it("refuses a precision it does not recognise", () => {
    const odd = { ...event(), place_precision: "somewhere" };
    expect(toGlobeEvents([odd as unknown as TimelineEvent], ERAS)).toEqual([]);
  });

  it("keeps timeline order and survives an event whose era is unknown", () => {
    const events = toGlobeEvents(
      [event({ slug: "a" }), event({ slug: "b", era_id: 99 })],
      ERAS,
    );
    expect(events.map((e) => e.slug)).toEqual(["a", "b"]);
    expect(events[1].era).toBeNull();
  });
});

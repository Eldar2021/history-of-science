/**
 * The strip along the foot of the home page: every published event, in order, one card each.
 *
 * The globe can only point at an event that has a place (ADR-025), so its list is shorter than the
 * strip's. `globeIndex` is the bridge between the two. `null` means we do not know where it
 * happened, and the globe stays where it is rather than inventing a spot for it.
 *
 * `unit` is the event's position on the real time axis (lib/timeline/xScale), which is what the
 * ribbon above the strip draws. Fifty cards of equal width say nothing about how long antiquity
 * was; the ribbon is where that stays honest.
 */
import type { PlacePrecision } from "@/lib/i18n/formatPlace";
import type { YearPrecision } from "@/lib/i18n/formatYear";
import type { Era, TimelineEvent } from "@/lib/queries/types";
import { TIMELINE_END, yearToUnit } from "@/lib/timeline/xScale";
import type { GlobeEvent } from "./events";

export type StripEvent = {
  slug: string;
  year: number;
  precision: YearPrecision;
  title: string;
  summary: string;
  /** Bare place name; the caveat comes from placePrecision (ADR-025). */
  placeName: string | null;
  placePrecision: PlacePrecision;
  /** Era name in the reader's language. */
  era: string | null;
  /** Position on the time axis, 0 at TIMELINE_START and 1 at TIMELINE_END. Clamped. */
  unit: number;
  /** Index into the globe's places, or null when there is no single place. */
  globeIndex: number | null;
};

export type RibbonEra = {
  slug: string;
  name: string;
  /** Both clamped to [0, 1]; startUnit is never greater than endUnit. */
  startUnit: number;
  endUnit: number;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function toStripEvents(
  timeline: TimelineEvent[],
  eraNames: Map<number, string>,
  places: GlobeEvent[],
): StripEvent[] {
  const globeIndexBySlug = new Map(places.map((p, i) => [p.slug, i]));
  return timeline.map((e) => ({
    slug: e.slug,
    year: e.year,
    precision: e.precision,
    title: e.title,
    summary: e.summary,
    placeName: e.place_name ?? null,
    placePrecision: e.place_precision,
    era: eraNames.get(e.era_id) ?? null,
    unit: clamp01(yearToUnit(e.year)),
    globeIndex: globeIndexBySlug.get(e.slug) ?? null,
  }));
}

/** Eras as bands on the ribbon. The last era usually has no end year; it runs to today. */
export function toRibbonEras(eras: Era[]): RibbonEra[] {
  return eras.map((era) => {
    const startUnit = clamp01(yearToUnit(era.start_year));
    return {
      slug: era.slug,
      name: era.name,
      startUnit,
      endUnit: Math.max(startUnit, clamp01(yearToUnit(era.end_year ?? TIMELINE_END))),
    };
  });
}

/** The event nearest a point on the time axis; -1 when there are none. Used when the ribbon is clicked. */
export function nearestByUnit(events: StripEvent[], unit: number): number {
  let best = -1;
  let bestDistance = Infinity;
  events.forEach((event, i) => {
    const distance = Math.abs(event.unit - unit);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  });
  return best;
}

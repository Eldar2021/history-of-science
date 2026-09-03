/**
 * Which timeline events can go on the globe, and in what shape.
 *
 * The guard is deliberately strict about missing values. A database that has not run migration
 * 0003 yet answers get_timeline without the place columns at all, so they arrive as `undefined`,
 * not `null` - and `undefined !== null`, so a loose check lets them through, puts NaN into the
 * camera and draws an empty sphere. That is a silent failure, and it shipped once. Hence `== null`,
 * which catches both, and an explicit finite check on the coordinates.
 */
import type { PlacePrecision } from "@/lib/i18n/formatPlace";
import type { YearPrecision } from "@/lib/i18n/formatYear";
import type { TimelineEvent } from "@/lib/queries/types";

/** One pin on the globe. Events with no single place never reach here (ADR-025). */
export type GlobePlace = {
  slug: string;
  lng: number;
  lat: number;
  placePrecision: PlacePrecision;
  /** Discipline slug; picks the pin colour from the design tokens. */
  discipline: string;
};

export type GlobeEvent = GlobePlace & {
  year: number;
  precision: YearPrecision;
  title: string;
  summary: string;
  /** Bare place name; the caveat comes from placePrecision (ADR-025). */
  placeName: string | null;
  /** Era name in the reader's language, so the counter says where in history we are. */
  era: string | null;
};

const PLACEABLE: PlacePrecision[] = ["exact", "city", "region", "continent"];

/**
 * The events the globe can point at, in timeline order. Anything without a usable place is left
 * out; when that empties the list, the home page shows its older opening instead of a blank world.
 */
export function toGlobeEvents(timeline: TimelineEvent[], eraNames: Map<number, string>): GlobeEvent[] {
  const events: GlobeEvent[] = [];
  for (const e of timeline) {
    if (e.lat == null || e.lng == null) continue;
    if (!Number.isFinite(e.lat) || !Number.isFinite(e.lng)) continue;
    if (e.place_precision == null || !PLACEABLE.includes(e.place_precision)) continue;
    events.push({
      slug: e.slug,
      lng: e.lng,
      lat: e.lat,
      placePrecision: e.place_precision,
      discipline: e.disciplines[0] ?? "technology",
      year: e.year,
      precision: e.precision,
      title: e.title,
      summary: e.summary,
      placeName: e.place_name ?? null,
      era: eraNames.get(e.era_id) ?? null,
    });
  }
  return events;
}

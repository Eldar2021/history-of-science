/**
 * The one time scale (doc/kararlar.md ADR-006): the minimap and the Explore canvas both map years
 * through here, so "real scale" means the same thing everywhere.
 *
 * Years are integers with no year 0 (ADR-004): -1 is followed by 1. For a continuous axis we shift
 * BCE years by one so that -1 and 1 are adjacent, matching yearsBetween() in formatYear.ts.
 */

export const TIMELINE_START = -600;
export const TIMELINE_END = 2026;

/** Continuous coordinate for a year: BCE years shift up by one so the axis has no hole at 0. */
export function toContinuous(year: number): number {
  return year < 0 ? year + 1 : year;
}

/** Inverse of toContinuous, rounding to the nearest existing year (never 0). */
export function fromContinuous(value: number): number {
  const r = Math.round(value);
  return r <= 0 ? r - 1 : r;
}

const SPAN = toContinuous(TIMELINE_END) - toContinuous(TIMELINE_START);

/** Full-range fraction in [0, 1]: TIMELINE_START -> 0, TIMELINE_END -> 1. Not clamped. */
export function yearToUnit(year: number): number {
  return (toContinuous(year) - toContinuous(TIMELINE_START)) / SPAN;
}

export function unitToYear(u: number): number {
  return fromContinuous(toContinuous(TIMELINE_START) + u * SPAN);
}

export type View = {
  /** Magnification: 1 shows the whole range, 2 shows half of it, ... */
  zoom: number;
  /** Left edge of the visible window as a full-range fraction in [0, 1 - 1/zoom]. */
  pan: number;
};

export const FULL_VIEW: View = { zoom: 1, pan: 0 };

/** Largest pan that keeps the window inside the range. */
export function clampPan(pan: number, zoom: number): number {
  const max = Math.max(0, 1 - 1 / zoom);
  return Math.min(max, Math.max(0, pan));
}

/**
 * Position of a year inside the visible window as a fraction: 0 = left edge, 1 = right edge.
 * Multiply by the pixel width of the strip or canvas. Values outside [0, 1] are off-screen.
 */
export function xScale(year: number, zoom = 1, pan = 0): number {
  return (yearToUnit(year) - pan) * zoom;
}

/** Year at a window fraction (inverse of xScale). */
export function xScaleInvert(x: number, zoom = 1, pan = 0): number {
  return unitToYear(x / zoom + pan);
}

/** How many years the visible window covers at this zoom. */
export function visibleYears(zoom: number): number {
  return SPAN / zoom;
}

/** Semantic zoom levels: Z0 universe, Z1 era, Z2 century, Z3 decade. */
export type ZoomLevel = 0 | 1 | 2 | 3;

export function zoomLevel(zoom: number): ZoomLevel {
  const years = visibleYears(zoom);
  if (years > 800) return 0;
  if (years > 200) return 1;
  if (years > 45) return 2;
  return 3;
}

/** Minimum importance shown at a zoom level (05: Z0 landmarks only ... Z3 everything). */
export function minImportanceAt(level: ZoomLevel): number {
  return ([5, 4, 3, 1] as const)[level];
}

/** Zoom in on a point so that the year under `x` stays under `x` (wheel/pinch behaviour). */
export function zoomAround(view: View, factor: number, x: number): View {
  const zoom = Math.max(1, view.zoom * factor);
  const anchor = x / view.zoom + view.pan; // full-range fraction under the cursor
  const pan = clampPan(anchor - x / zoom, zoom);
  return { zoom, pan };
}

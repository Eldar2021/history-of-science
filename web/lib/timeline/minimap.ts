import { yearToUnit } from "./xScale";

/**
 * Event density along the real time axis (doc/05: the minimap is a "▁▂▅█" strip). Years are bucketed by
 * their full-range fraction; heights are square-rooted so one crowded decade does not flatten the rest.
 * Returns `bins` values in [0, 1].
 */
export function densityBins(years: number[], bins: number): number[] {
  const counts = new Array<number>(bins).fill(0);
  for (const y of years) {
    const i = Math.min(bins - 1, Math.max(0, Math.floor(yearToUnit(y) * bins)));
    counts[i] += 1;
  }
  const max = Math.max(0, ...counts);
  return max === 0 ? counts : counts.map((c) => Math.sqrt(c / max));
}

/** The card whose year is closest to `year` (ties: the earlier one, since cards are in year order). */
export function closestIndex(years: number[], year: number): number {
  let best = 0;
  let bestDist = Infinity;
  years.forEach((y, i) => {
    const d = Math.abs(y - year);
    if (d < bestDist) { best = i; bestDist = d; }
  });
  return best;
}

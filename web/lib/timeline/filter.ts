/** Discipline filter state, kept in the URL (`?d=physics,astronomy&only=1`, doc/05 Navigasyon). */

/** `?d=physics,astronomy` -> Set. Unknown slugs are ignored so a stale link cannot dim everything. */
export function parseSelected(param: string | null, known: Set<string>): Set<string> {
  return new Set((param ?? "").split(",").map((s) => s.trim()).filter((s) => known.has(s)));
}

/** No selection matches everything; otherwise any shared discipline is enough. */
export function matchesFilter(selected: Set<string>, disciplines: string[]): boolean {
  return selected.size === 0 || disciplines.some((d) => selected.has(d));
}

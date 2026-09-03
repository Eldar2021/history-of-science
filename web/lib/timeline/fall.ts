/** "Fall into time" (doc/05 Problem 2): the counter runs from now back to the first event. */
export const FALL_FLAG = "uchkun-fall";
export const FALL_FROM = 2026;

/** Ease-out: fast at first, settling as it lands. */
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
}

/** CSS time -> ms. The minifier rewrites "1500ms" as "1.5s", so the unit matters. */
export function parseDuration(value: string, fallback: number): number {
  const m = /^\s*(-?[\d.]+)\s*(ms|s)?\s*$/i.exec(value);
  if (!m) return fallback;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return fallback;
  return m[2]?.toLowerCase() === "s" ? n * 1000 : n;
}

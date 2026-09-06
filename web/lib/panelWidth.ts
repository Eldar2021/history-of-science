/**
 * How wide the event panel is on desktop. The reader drags its left edge and the choice is
 * remembered in their browser; a 1100-word body at 30rem was too narrow to read comfortably.
 * Pure so the clamping can be tested without a DOM (the panel itself is a client component).
 */
export const PANEL_WIDTH_KEY = "uchkun:panel-width";
/** 24rem: narrower and the year, the era line and the chips start wrapping every other word. */
export const PANEL_MIN_PX = 384;
/** 30rem: what the panel was before it could be resized, so nobody's first sight of it changed. */
export const PANEL_DEFAULT_PX = 480;
/** 56rem: past this the measure is too long to read, and the globe behind it disappears. */
export const PANEL_MAX_PX = 896;
/** One arrow key press on the drag handle. */
export const PANEL_STEP_PX = 32;

/** The widest the panel may be here: never the whole window, so the timeline behind stays visible. */
export function maxPanelWidth(viewportPx: number): number {
  return Math.max(PANEL_MIN_PX, Math.min(PANEL_MAX_PX, Math.round(viewportPx * 0.9)));
}

export function clampPanelWidth(px: number, viewportPx: number): number {
  return Math.min(Math.max(Math.round(px), PANEL_MIN_PX), maxPanelWidth(viewportPx));
}

/** The remembered width, clamped to this window; null when nothing sensible is stored. */
export function parsePanelWidth(raw: string | null, viewportPx: number): number | null {
  if (raw === null || raw.trim() === "") return null;
  const px = Number(raw);
  if (!Number.isFinite(px) || px <= 0) return null;
  return clampPanelWidth(px, viewportPx);
}

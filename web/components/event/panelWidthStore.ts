import { PANEL_DEFAULT_PX, PANEL_MAX_PX, PANEL_WIDTH_KEY, clampPanelWidth, maxPanelWidth, parsePanelWidth } from "@/lib/panelWidth";

/**
 * The panel width is not React's to own: it lives in localStorage and depends on the window size,
 * both of which the server cannot see. Keeping it in an external store lets the panel render at the
 * default on the server, adopt the remembered width on hydration without a mismatch, and follow a
 * window resize - none of which a useState + effect pair does without a cascading render.
 */
const listeners = new Set<() => void>();
let width: number | null = null;
let max: number | null = null;

function stored(): string | null {
  try {
    return localStorage.getItem(PANEL_WIDTH_KEY);
  } catch {
    // A browser with site data blocked: the panel opens at the default and forgets, nothing worse.
    return null;
  }
}

function measure() {
  max = maxPanelWidth(window.innerWidth);
  width = parsePanelWidth(stored(), window.innerWidth) ?? clampPanelWidth(PANEL_DEFAULT_PX, window.innerWidth);
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onResize = () => {
    // Re-read the stored width rather than the shown one: a width chosen on a wide screen is only
    // squeezed while the window is small, and comes back when it grows again.
    measure();
    emit();
  };
  window.addEventListener("resize", onResize);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("resize", onResize);
  };
}

export function getPanelWidth(): number {
  if (width === null) measure();
  return width!;
}

export function getMaxPanelWidth(): number {
  if (max === null) measure();
  return max!;
}

/** What the server renders, and what hydration starts from: the width the panel has always had. */
export const getServerPanelWidth = () => PANEL_DEFAULT_PX;
export const getServerMaxPanelWidth = () => PANEL_MAX_PX;

/**
 * Move the edge. Dragging calls this on every pointer move and only remembers the width when the
 * reader lets go, so a drag leaves one entry in localStorage rather than a hundred.
 */
export function setPanelWidth(px: number, { remember = false } = {}): number {
  const next = clampPanelWidth(px, window.innerWidth);
  width = next;
  max = maxPanelWidth(window.innerWidth);
  if (remember) {
    try {
      localStorage.setItem(PANEL_WIDTH_KEY, String(next));
    } catch {
      // Ignored: see stored().
    }
  }
  emit();
  return next;
}

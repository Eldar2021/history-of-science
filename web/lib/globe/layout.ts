/**
 * Where the globe sits in its stage, shared by the canvas and the card so the two cannot drift.
 *
 * On a phone the globe is smaller and sits high, leaving the lower half to the card: the card
 * would otherwise cover the very place it is pointing at. On a wider screen the place stays in
 * the middle of the screen and the card sits beside it.
 */
export const MOBILE_MAX_WIDTH = 640;

export type GlobeLayout = {
  /** Centre of the sphere, as a fraction of the stage. */
  focusX: number;
  focusY: number;
  /** Sphere radius, as a fraction of the smaller side of the stage. */
  radiusScale: number;
};

export const DESKTOP_LAYOUT: GlobeLayout = { focusX: 0.5, focusY: 0.5, radiusScale: 0.42 };
export const MOBILE_LAYOUT: GlobeLayout = { focusX: 0.5, focusY: 0.33, radiusScale: 0.40 };

export const layoutFor = (width: number): GlobeLayout =>
  width < MOBILE_MAX_WIDTH ? MOBILE_LAYOUT : DESKTOP_LAYOUT;

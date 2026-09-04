/**
 * Orthographic globe geometry. See doc/09 ADR-024.
 *
 * The whole globe is a sphere seen from infinitely far away, so the maths is small enough to
 * keep here rather than pull in a projection library: the browser bundle has no dependency of
 * its own. Angles are degrees in, radians only inside.
 *
 * The camera is described by the geographic point sitting at the centre of the disc, because
 * that is exactly what the home page needs: the event's place is always in the middle.
 */

/** The point at the centre of the visible disc. */
export type Centre = { lng: number; lat: number };

export type ScreenPoint = {
  x: number;
  y: number;
  visible: boolean;
  /** 1 facing us, 0 on the rim, negative on the far side. Lets the drawing fade toward the edge. */
  depth: number;
};

const RAD = Math.PI / 180;
export const EARTH_RADIUS_KM = 6371;

/**
 * Project a place onto the disc. `visible` is false for the far side of the globe; callers
 * still get coordinates so a marker can fade out rather than jump.
 */
export function project(lng: number, lat: number, centre: Centre, radius: number, cx: number, cy: number): ScreenPoint {
  const phi = lat * RAD;
  const phi0 = centre.lat * RAD;
  const dLambda = (lng - centre.lng) * RAD;
  const cosPhi = Math.cos(phi);
  const cosC = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * cosPhi * Math.cos(dLambda);
  return {
    x: cx + radius * cosPhi * Math.sin(dLambda),
    y: cy - radius * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * cosPhi * Math.cos(dLambda)),
    visible: cosC >= 0,
    depth: cosC,
  };
}

/** Signed shortest way round from a to b, in degrees, in (-180, 180]. */
export function shortestLngDelta(a: number, b: number): number {
  return ((((b - a) % 360) + 540) % 360) - 180;
}

/** Camera position part way from one centre to another, always turning the short way. */
export function interpolateCentre(from: Centre, to: Centre, t: number): Centre {
  return {
    lng: from.lng + shortestLngDelta(from.lng, to.lng) * t,
    lat: from.lat + (to.lat - from.lat) * t,
  };
}

/** Slow at both ends: the globe settles rather than stops. */
export function easeInOutCubic(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/** Angle between two places, in radians. */
export function angularDistance(aLng: number, aLat: number, bLng: number, bLat: number): number {
  const p1 = aLat * RAD;
  const p2 = bLat * RAD;
  const dl = (bLng - aLng) * RAD;
  const cos = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl);
  return Math.acos(Math.min(1, Math.max(-1, cos)));
}

/**
 * The shortest path over the surface from a to b, as `steps + 1` points. Used to draw the trail
 * the tour leaves behind: knowledge moving from Alexandria to Baghdad to Samarkand.
 */
export function greatCirclePath(aLng: number, aLat: number, bLng: number, bLat: number, steps = 48): Array<[number, number]> {
  const d = angularDistance(aLng, aLat, bLng, bLat);
  const out: Array<[number, number]> = [];
  if (d < 1e-9) return [[aLng, aLat]];
  const sinD = Math.sin(d);
  const [p1, l1, p2, l2] = [aLat * RAD, aLng * RAD, bLat * RAD, bLng * RAD];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const A = Math.sin((1 - t) * d) / sinD;
    const B = Math.sin(t * d) / sinD;
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    out.push([Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD]);
  }
  return out;
}

/**
 * A ring of points at a fixed distance from a place: the dashed circle that admits we only know
 * the region, not the spot (ADR-025).
 */
export function circlePath(lng: number, lat: number, radiusKm: number, steps = 64): Array<[number, number]> {
  const delta = radiusKm / EARTH_RADIUS_KM;
  const phi1 = lat * RAD;
  const lambda1 = lng * RAD;
  const [sinPhi1, cosPhi1, sinD, cosD] = [Math.sin(phi1), Math.cos(phi1), Math.sin(delta), Math.cos(delta)];
  const out: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI;
    const phi2 = Math.asin(sinPhi1 * cosD + cosPhi1 * sinD * Math.cos(bearing));
    const lambda2 = lambda1 + Math.atan2(Math.sin(bearing) * sinD * cosPhi1, cosD - sinPhi1 * Math.sin(phi2));
    out.push([(((lambda2 / RAD + 540) % 360) - 180), phi2 / RAD]);
  }
  return out;
}

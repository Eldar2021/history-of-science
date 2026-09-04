import { describe, expect, it } from "vitest";
import {
  angularDistance, circlePath, EARTH_RADIUS_KM, easeInOutCubic, greatCirclePath,
  interpolateCentre, project, shortestLngDelta,
} from "./projection";

const SAMARKAND = { lng: 67.0053, lat: 39.6753 };

describe("project", () => {
  it("puts the camera centre in the middle of the disc", () => {
    const p = project(SAMARKAND.lng, SAMARKAND.lat, SAMARKAND, 200, 300, 300);
    expect(p.x).toBeCloseTo(300, 6);
    expect(p.y).toBeCloseTo(300, 6);
    expect(p.visible).toBe(true);
  });

  it("hides the far side of the globe", () => {
    const antipode = { lng: SAMARKAND.lng - 180, lat: -SAMARKAND.lat };
    expect(project(antipode.lng, antipode.lat, SAMARKAND, 200, 0, 0).visible).toBe(false);
  });

  it("places a quarter turn away exactly on the rim", () => {
    const p = project(0, 0, { lng: 90, lat: 0 }, 200, 0, 0);
    expect(Math.hypot(p.x, p.y)).toBeCloseTo(200, 6);
  });

  it("puts north above the centre and east to its right", () => {
    const north = project(0, 10, { lng: 0, lat: 0 }, 200, 0, 0);
    const east = project(10, 0, { lng: 0, lat: 0 }, 200, 0, 0);
    expect(north.y).toBeLessThan(0); // canvas y grows downward
    expect(east.x).toBeGreaterThan(0);
  });
});

describe("shortestLngDelta", () => {
  it("crosses the antimeridian rather than going the long way round", () => {
    expect(shortestLngDelta(170, -170)).toBeCloseTo(20, 9);
    expect(shortestLngDelta(-170, 170)).toBeCloseTo(-20, 9);
    expect(shortestLngDelta(0, 90)).toBeCloseTo(90, 9);
  });
});

describe("interpolateCentre", () => {
  it("returns the ends unchanged", () => {
    const a = { lng: 30, lat: 10 };
    const b = { lng: -60, lat: -20 };
    expect(interpolateCentre(a, b, 0)).toEqual(a);
    expect(interpolateCentre(a, b, 1).lng).toBeCloseTo(b.lng, 9);
    expect(interpolateCentre(a, b, 1).lat).toBeCloseTo(b.lat, 9);
  });

  it("takes the short path over the Pacific, not back across Eurasia", () => {
    const mid = interpolateCentre({ lng: 170, lat: 0 }, { lng: -170, lat: 0 }, 0.5);
    expect(mid.lng).toBeCloseTo(180, 9);
  });
});

describe("easeInOutCubic", () => {
  it("is clamped, symmetric and still at both ends", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(-5)).toBe(0);
    expect(easeInOutCubic(5)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 9);
  });
});

describe("greatCirclePath", () => {
  it("starts and ends where it was asked to", () => {
    const path = greatCirclePath(29.9187, 31.2001, 67.0053, 39.6753, 16); // Alexandria to Samarkand
    expect(path[0][0]).toBeCloseTo(29.9187, 4);
    expect(path[0][1]).toBeCloseTo(31.2001, 4);
    expect(path[path.length - 1][0]).toBeCloseTo(67.0053, 4);
    expect(path[path.length - 1][1]).toBeCloseTo(39.6753, 4);
    expect(path).toHaveLength(17);
  });

  it("bulges north of the straight line, the way a real route does", () => {
    // Two points on the same parallel: the shortest path over the sphere goes poleward.
    const path = greatCirclePath(0, 50, 80, 50, 16);
    expect(path[8][1]).toBeGreaterThan(50);
  });

  it("collapses to a single point when both ends are the same", () => {
    expect(greatCirclePath(10, 20, 10, 20)).toEqual([[10, 20]]);
  });
});

describe("circlePath", () => {
  it("keeps every point at the requested distance", () => {
    const km = 300;
    for (const [lng, lat] of [[67, 39.7], [0, 0], [-74.4, 40.7]]) {
      for (const [plng, plat] of circlePath(lng, lat, km, 24)) {
        expect(angularDistance(lng, lat, plng, plat) * EARTH_RADIUS_KM).toBeCloseTo(km, 3);
      }
    }
  });

  it("closes the ring", () => {
    const ring = circlePath(67, 39.7, 300, 24);
    expect(ring[0][0]).toBeCloseTo(ring[ring.length - 1][0], 6);
    expect(ring[0][1]).toBeCloseTo(ring[ring.length - 1][1], 6);
  });
});

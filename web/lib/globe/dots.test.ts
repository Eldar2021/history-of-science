import { describe, expect, it } from "vitest";
import { isLand, landDots } from "./dots";

describe("isLand", () => {
  it("knows the places the timeline actually talks about", () => {
    const land: Array<[number, number, string]> = [
      [67.0053, 39.6753, "Samarkand"],
      [44.3661, 33.3152, "Baghdad"],
      [29.9187, 31.2001, "Alexandria"],
      [8.2473, 49.9929, "Mainz"],
      [-74.4007, 40.6836, "Murray Hill"],
      [85.1376, 25.5941, "Pataliputra"],
    ];
    for (const [lng, lat, name] of land) expect(isLand(lng, lat), name).toBe(true);
  });

  it("knows the open ocean is not land", () => {
    const sea: Array<[number, number, string]> = [
      [-140, 0, "mid Pacific"],
      [-30, 0, "mid Atlantic"],
      [80, -40, "southern Indian Ocean"],
    ];
    for (const [lng, lat, name] of sea) expect(isLand(lng, lat), name).toBe(false);
  });
});

describe("landDots", () => {
  it("returns only land, and enough of it to draw continents", () => {
    const dots = landDots(1.3);
    const kept = dots.length / 2;
    expect(kept).toBeGreaterThan(4000);
    for (let i = 0; i < dots.length; i += 2) expect(isLand(dots[i], dots[i + 1])).toBe(true);
  });

  it("gets denser as the spacing shrinks", () => {
    expect(landDots(1.3).length).toBeGreaterThan(landDots(3).length);
  });

  it("spreads dots over both hemispheres instead of bunching at a pole", () => {
    const dots = landDots(2);
    let north = 0;
    let south = 0;
    for (let i = 1; i < dots.length; i += 2) {
      if (dots[i] > 0) north++;
      else south++;
    }
    expect(south / north).toBeGreaterThan(0.2); // most land is northern, but not all of it
  });

  it("stays inside real coordinate ranges", () => {
    const dots = landDots(3);
    for (let i = 0; i < dots.length; i += 2) {
      expect(Math.abs(dots[i])).toBeLessThanOrEqual(180);
      expect(Math.abs(dots[i + 1])).toBeLessThanOrEqual(90);
    }
  });
});

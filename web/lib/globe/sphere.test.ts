import { describe, expect, it } from "vitest";
import { renderSphere, type Texture } from "./sphere";

/**
 * A texture whose red channel encodes the column and green channel the row, so a rendered pixel
 * says which part of the map it came from. Blue is constant so shading can be measured.
 */
const W = 256;
const H = 128;
const probe: Texture = (() => {
  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      data[i] = Math.round((x / (W - 1)) * 255);
      data[i + 1] = Math.round((y / (H - 1)) * 255);
      data[i + 2] = 200;
      data[i + 3] = 255;
    }
  }
  return { data, width: W, height: H };
})();

const SIZE = 64;
const render = (lng: number, lat: number) => {
  const out = new Uint8ClampedArray(SIZE * SIZE * 4);
  renderSphere(out, SIZE, probe, { lng, lat });
  return out;
};
const at = (out: Uint8ClampedArray, px: number, py: number) => {
  const i = (py * SIZE + px) * 4;
  return { r: out[i], g: out[i + 1], b: out[i + 2], a: out[i + 3] };
};

/**
 * Where a pixel came from in the texture, as fractions of its width and height. The light shades
 * every channel by the same factor, so dividing by the texture's constant blue removes it and
 * leaves the mapping alone - which is what these tests are about.
 */
const source = (out: Uint8ClampedArray, px: number, py: number) => {
  const { r, g, b } = at(out, px, py);
  return { u: (r / b) * (200 / 255), v: (g / b) * (200 / 255) };
};

describe("renderSphere", () => {
  it("leaves the corners outside the disc transparent", () => {
    const out = render(0, 0);
    for (const [x, y] of [[0, 0], [SIZE - 1, 0], [0, SIZE - 1], [SIZE - 1, SIZE - 1]]) {
      expect(at(out, x, y).a).toBe(0);
    }
  });

  it("fills the middle of the disc", () => {
    expect(at(render(0, 0), SIZE / 2, SIZE / 2).a).toBe(255);
  });

  it("puts the camera's own longitude in the centre of the disc", () => {
    // Longitude 0 sits halfway across the texture.
    expect(source(render(0, 0), SIZE / 2, SIZE / 2).u).toBeCloseTo(0.5, 1);
    // Turning the globe east moves a different meridian into the middle.
    expect(source(render(90, 0), SIZE / 2, SIZE / 2).u).toBeCloseTo(0.75, 1);
  });

  it("puts the camera's own latitude in the centre of the disc", () => {
    // The texture runs from the north pole (v = 0) to the south pole (v = 1).
    expect(source(render(0, 0), SIZE / 2, SIZE / 2).v).toBeCloseTo(0.5, 1);
    expect(source(render(0, 60), SIZE / 2, SIZE / 2).v).toBeCloseTo(1 / 6, 1);
  });

  it("keeps north above the centre and east to its right", () => {
    const out = render(0, 0);
    const q = Math.round(SIZE * 0.18);
    // Up the screen is toward the north pole, which is the top of the texture.
    expect(source(out, SIZE / 2, SIZE / 2 - q).v).toBeLessThan(source(out, SIZE / 2, SIZE / 2).v);
    // Right of centre is further east, which is further across the texture.
    expect(source(out, SIZE / 2 + q, SIZE / 2).u).toBeGreaterThan(source(out, SIZE / 2, SIZE / 2).u);
  });

  it("lights the globe from one side, so it is not a flat disc", () => {
    const out = render(0, 0);
    const q = Math.round(SIZE * 0.34);
    const lit = at(out, SIZE / 2 - q, SIZE / 2 - q); // toward the light: upper left
    const dark = at(out, SIZE / 2 + q, SIZE / 2 + q); // away from it: lower right
    expect(lit.b).toBeGreaterThan(dark.b);
    // and never fully black, or half the world would disappear
    expect(dark.b).toBeGreaterThan(0.3 * 200);
  });

  it("softens the very edge instead of cutting it off", () => {
    const out = render(0, 0);
    const rim = at(out, 1, SIZE / 2);
    expect(rim.a).toBeGreaterThan(0);
    expect(rim.a).toBeLessThan(255);
  });
});

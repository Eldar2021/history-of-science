/**
 * The Earth, drawn one pixel at a time.
 *
 * For every pixel of the disc we run the orthographic projection backwards to a latitude and
 * longitude, read that point out of an equirectangular photograph of the Earth, and shade it with
 * a single light. That is what turns a circle into a ball: the terminator and the way the texture
 * compresses toward the limb are the cues the eye actually uses.
 *
 * Pure and free of the DOM - it fills a plain byte array - so the mapping can be tested.
 * See doc/09 ADR-026 for why a photograph replaced the field of dots.
 */
import type { Centre } from "./projection";

export type Texture = {
  /** RGBA, row-major, equirectangular: x spans -180..180 of longitude, y spans 90..-90 of latitude. */
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

const RAD = Math.PI / 180;

/**
 * Direction the light comes from, in view space: up, a little to the left, and towards the reader.
 * Matching the shading to where the page's shadows fall keeps the globe from looking pasted on.
 */
const LIGHT = (() => {
  const [x, y, z] = [-0.34, 0.44, 0.83];
  const len = Math.hypot(x, y, z);
  return { x: x / len, y: y / len, z: z / len };
})();

/** How much of the far side still shows. Zero would make half the globe pure black. */
const AMBIENT = 0.34;

/**
 * Draw the sphere into `out`, a square RGBA buffer of `size` x `size` pixels. The globe fills it
 * edge to edge; pixels outside the disc are left fully transparent.
 */
export function renderSphere(out: Uint8ClampedArray, size: number, tex: Texture, centre: Centre): void {
  const radius = size / 2;
  const phi0 = centre.lat * RAD;
  const lambda0 = centre.lng * RAD;
  const sinPhi0 = Math.sin(phi0);
  const cosPhi0 = Math.cos(phi0);
  /** One pixel of the disc, in disc-radius units: used to soften the edge. */
  const edge = 1.5 / radius;

  for (let py = 0; py < size; py++) {
    const y = -((py + 0.5 - radius) / radius);
    const y2 = y * y;
    let i = py * size * 4;
    for (let px = 0; px < size; px++, i += 4) {
      const x = (px + 0.5 - radius) / radius;
      const rho2 = x * x + y2;
      if (rho2 >= 1) { out[i + 3] = 0; continue; }

      const cosC = Math.sqrt(1 - rho2);
      // Inverse orthographic. sin(c) is the radius itself, which cancels out of both terms.
      const lat = Math.asin(cosC * sinPhi0 + y * cosPhi0);
      const lng = lambda0 + Math.atan2(x, cosC * cosPhi0 - y * sinPhi0);

      // Equirectangular lookup, wrapping the longitude so the seam never shows.
      let u = ((lng / RAD + 180) % 360 + 360) % 360 / 360 * tex.width;
      let v = (90 - lat / RAD) / 180 * tex.height;
      u = u < 0 ? 0 : u >= tex.width ? tex.width - 1 : u;
      v = v < 0 ? 0 : v >= tex.height ? tex.height - 1 : v;
      const t = ((v | 0) * tex.width + (u | 0)) * 4;

      // One light, so the globe has a lit side and a terminator.
      const lambert = x * LIGHT.x + y * LIGHT.y + cosC * LIGHT.z;
      const shade = AMBIENT + (1 - AMBIENT) * (lambert > 0 ? lambert : 0);

      out[i] = tex.data[t] * shade;
      out[i + 1] = tex.data[t + 1] * shade;
      out[i + 2] = tex.data[t + 2] * shade;
      // Fade the last pixel of the limb, or the globe gets a hard jagged edge.
      const rho = Math.sqrt(rho2);
      out[i + 3] = rho > 1 - edge ? ((1 - rho) / edge) * 255 : 255;
    }
  }
}

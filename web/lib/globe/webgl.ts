/**
 * The Earth, drawn by the graphics card.
 *
 * The same picture as lib/globe/sphere.ts, made the same way: for every pixel of the disc, run the
 * orthographic projection backwards to a latitude and longitude, read that point out of an
 * equirectangular photograph, and shade it with one light. The difference is who does the
 * arithmetic. A fragment shader does it for every pixel at once, so the globe is drawn at full
 * resolution on every frame of a turn, with the photograph filtered properly (mipmaps, so the
 * compressed limb does not sparkle), and there is money left over for a glint of sun on the
 * water and a thin sky along the rim. See doc/kararlar.md ADR-024.
 *
 * WebGL2 only. Where it is missing the caller falls back to sphere.ts, which draws the same globe
 * more slowly; the pins, the road and the card never depend on either.
 */
import type { Centre } from "./projection";

const RAD = Math.PI / 180;

/**
 * Direction the light comes from, in view space: up, a little to the left, and towards the reader.
 * The same light as sphere.ts, so the fallback and the real thing agree.
 */
const LIGHT = [-0.34, 0.44, 0.83] as const;
/** How much of the night side still shows. Zero would make half the globe pure black. */
const AMBIENT = 0.34;
/** The sky seen edge-on: a pale blue that is added, thinly, along the limb. */
const ATMOSPHERE = [0.42, 0.6, 0.95] as const;

const VERTEX = `#version 300 es
in vec2 a_corner;
uniform vec2 u_centre;
uniform float u_radius;
uniform vec2 u_stage;
out vec2 v_disc;
void main() {
  v_disc = a_corner;
  vec2 px = u_centre + vec2(a_corner.x, -a_corner.y) * u_radius;
  gl_Position = vec4(px.x / u_stage.x * 2.0 - 1.0, 1.0 - px.y / u_stage.y * 2.0, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 v_disc;
uniform sampler2D u_earth;
uniform float u_sinPhi0;
uniform float u_cosPhi0;
uniform float u_lambda0;
uniform float u_edge;
uniform float u_ambient;
uniform vec3 u_light;
uniform vec3 u_atmosphere;
out vec4 outColor;
const float PI = 3.141592653589793;

void main() {
  float x = v_disc.x;
  float y = v_disc.y;
  // Pixels outside the disc still run to the end so the derivatives below stay defined; they
  // come out with zero alpha.
  float rho2 = min(dot(v_disc, v_disc), 0.999999);
  float cosC = sqrt(1.0 - rho2);

  // Inverse orthographic, then an equirectangular lookup.
  float lat = asin(cosC * u_sinPhi0 + y * u_cosPhi0);
  float lng = u_lambda0 + atan(x, cosC * u_cosPhi0 - y * u_sinPhi0);
  vec2 uv = vec2(lng / (2.0 * PI) + 0.5, 0.5 - lat / PI);

  // The map's left and right edges meet at the date line. Where that seam crosses the disc, u
  // jumps by a whole map width between neighbouring pixels, and a mipmap chosen from that jump
  // is the blurriest one there is: a soft line down the Pacific. Measure the change with the
  // seam moved half a world away as well, and trust whichever measurement is smaller.
  vec2 uvShifted = vec2(fract(uv.x + 0.5), uv.y);
  vec2 dxA = dFdx(uv);
  vec2 dyA = dFdy(uv);
  vec2 dxB = dFdx(uvShifted);
  vec2 dyB = dFdy(uvShifted);
  bool a = dot(dxA, dxA) + dot(dyA, dyA) <= dot(dxB, dxB) + dot(dyB, dyB);
  vec3 texel = a ? textureGrad(u_earth, uv, dxA, dyA).rgb : textureGrad(u_earth, uv, dxB, dyB).rgb;

  // One light: a lit side, a terminator, and a night side that is dim rather than gone.
  vec3 n = vec3(x, y, cosC);
  float lambert = max(dot(n, u_light), 0.0);
  float shade = u_ambient + (1.0 - u_ambient) * lambert;
  vec3 colour = texel * shade;

  // Sun on the water. The photograph carries no water mask, but blue winning over both red and
  // green is one: nothing on land is that colour.
  float water = smoothstep(0.03, 0.15, texel.b - max(texel.r, texel.g));
  vec3 halfway = normalize(u_light + vec3(0.0, 0.0, 1.0));
  float glint = pow(max(dot(n, halfway), 0.0), 70.0) * water * 0.5 * smoothstep(0.0, 0.2, lambert);
  colour += glint * vec3(1.0, 0.96, 0.88);

  // A thin sky at the limb, brighter on the day side.
  float rim = pow(1.0 - cosC, 3.0);
  colour += u_atmosphere * rim * (0.22 + 0.45 * lambert);

  // Fade the last pixel of the limb, or the globe gets a hard jagged edge.
  float alpha = 1.0 - smoothstep(1.0 - u_edge, 1.0, sqrt(rho2));
  outColor = vec4(colour * alpha, alpha);
}`;

export type GlobeView = {
  centre: Centre;
  /** Disc centre and radius, in device pixels of the canvas. */
  cx: number;
  cy: number;
  radius: number;
  /** Canvas size, in device pixels. */
  width: number;
  height: number;
};

export type GlobeGl = {
  /** Upload the photograph, replacing any earlier one. False if the card cannot hold it. */
  setTexture(image: HTMLImageElement): boolean;
  hasTexture(): boolean;
  render(view: GlobeView): void;
  dispose(): void;
};

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("globe shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Set the globe up on a canvas. Null where WebGL2 is not to be had, in which case the caller
 * draws the sphere itself; nothing about the page depends on this succeeding.
 */
export function createGlobeGl(canvas: HTMLCanvasElement): GlobeGl | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  });
  // A context can be handed back already dead, for instance while the browser is still bringing
  // one back after a loss; the caller draws on the processor until webglcontextrestored fires.
  if (!gl || gl.isContextLost()) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("globe program:", gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  // One square, corners in disc units; the vertex shader puts it where the globe is.
  const corners = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);
  const aCorner = gl.getAttribLocation(program, "a_corner");
  gl.enableVertexAttribArray(aCorner);
  gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    centre: u("u_centre"),
    radius: u("u_radius"),
    stage: u("u_stage"),
    sinPhi0: u("u_sinPhi0"),
    cosPhi0: u("u_cosPhi0"),
    lambda0: u("u_lambda0"),
    edge: u("u_edge"),
  };
  gl.uniform1i(u("u_earth"), 0);
  gl.uniform1f(u("u_ambient"), AMBIENT);
  gl.uniform3f(u("u_light"), ...LIGHT);
  gl.uniform3f(u("u_atmosphere"), ...ATMOSPHERE);
  gl.disable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);

  const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const anisotropy = gl.getExtension("EXT_texture_filter_anisotropic");
  let texture: WebGLTexture | null = null;

  return {
    setTexture(image) {
      if (image.naturalWidth > maxSize || image.naturalHeight > maxSize) return false;
      if (!texture) texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Row 0 of the photograph is the north pole, which is where v = 0 samples: no flip.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // Longitude wraps; latitude does not.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (anisotropy) {
        // The map is squeezed hard along the limb; this keeps coastlines there from smearing.
        const max = gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
        gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
      }
      return true;
    },
    hasTexture: () => texture !== null,
    render({ centre, cx, cy, radius, width, height }) {
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!texture) return;
      const phi0 = centre.lat * RAD;
      gl.uniform2f(uniforms.centre, cx, cy);
      gl.uniform1f(uniforms.radius, radius);
      gl.uniform2f(uniforms.stage, width, height);
      gl.uniform1f(uniforms.sinPhi0, Math.sin(phi0));
      gl.uniform1f(uniforms.cosPhi0, Math.cos(phi0));
      gl.uniform1f(uniforms.lambda0, centre.lng * RAD);
      // One and a half device pixels of softening at the edge, in disc-radius units.
      gl.uniform1f(uniforms.edge, 1.5 / Math.max(1, radius));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      // Only our own objects are released. The context itself is left alone: a canvas keeps the
      // same context for life, and deliberately losing it would hand the next set-up on this
      // canvas (React's development double-mount, for one) a dead one.
      if (texture) gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    },
  };
}

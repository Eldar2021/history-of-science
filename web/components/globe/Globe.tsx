"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { layoutFor } from "@/lib/globe/layout";
import { renderSphere, type Texture } from "@/lib/globe/sphere";
import { createGlobeGl, type GlobeGl } from "@/lib/globe/webgl";
import { circlePath, EARTH_RADIUS_KM, easeInOutCubic, greatCirclePath, interpolateCentre, project, type Centre } from "@/lib/globe/projection";
import { PLACE_RADIUS_KM } from "@/lib/i18n/formatPlace";
import type { GlobePlace } from "@/lib/globe/events";

type Props = {
  places: GlobePlace[];
  /** Index into `places` that must sit in the centre of the disc; -1 when nothing is being pointed at. */
  activeIndex: number;
  /**
   * How many legs of the road to draw, when that is not the same as `activeIndex`: an event with no
   * place leaves the globe where it was, and the road it travelled should stay drawn behind it.
   */
  trailTo?: number;
  onSelect?: (index: number) => void;
  /** Change this to ask the globe to turn back to the active place after a hand-turn. */
  recenterKey?: number;
  /** Called when the reader drags the active place away from the centre, and when it comes back. */
  onOffCentreChange?: (offCentre: boolean) => void;
  /** Label for assistive technology; the canvas itself carries no information. */
  ariaLabel?: string;
  className?: string;
};

/**
 * NASA's Blue Marble Next Generation, July 2004: land, shaded topography and, unlike the plain
 * Blue Marble, the ocean floor, so deep water reads dark and shelves pale. 2048 x 1024; 176 KB as WebP, 262 KB as JPEG.
 * Source: https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73751/world.topo.bathy.200407.3x5400x2700.jpg
 * NASA Earth science imagery is not copyrighted and carries no usage restriction; NASA asks only
 * to be credited, which the honesty dialog does. See doc/kararlar.md ADR-024.
 */
const EARTH_TEXTURE = ["/globe/earth-2048.webp", "/globe/earth-2048.jpg"] as const;
/**
 * The same photograph at 4096 x 2048, so the upgrade only sharpens and never changes what
 * the Earth looks like. Fetched after the small one is already on screen, and only where it will
 * actually be seen: a 2048-wide map supplies about a thousand pixels across the hemisphere we can
 * see, so anything wider than that is being stretched. On the graphics card it costs about 43 MB
 * with its mipmaps, which is why small and frugal devices keep the small one.
 */
/* WebP first, JPEG behind it: the same photograph a third lighter (176 KB and 587 KB), with the
   original left in place for anything that cannot decode WebP. */
const EARTH_TEXTURE_HIGH = ["/globe/earth-4096.webp", "/globe/earth-4096.jpg"] as const;
const HEMISPHERE_PIXELS_2048 = 1024;
/**
 * Fallback only, for a browser without WebGL2: fraction of full resolution to draw at while the
 * globe is turning. On the processor every pixel of the disc costs an arcsine and an arctangent,
 * so a moving globe is drawn smaller and scaled up, and settles at full resolution on the last
 * frame. The graphics card draws every frame in full.
 */
const MOVING_QUALITY = 0.55;
/** Whether this screen would actually show the difference, on a device that can afford it. */
function wantsSharperEarth(width: number, height: number, dpr: number): boolean {
  if (width === 0) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 8) < 4) return false;
  const layout = layoutFor(width);
  const diameter = 2 * Math.min(width, height) * layout.radiusScale * dpr;
  return diameter > HEMISPHERE_PIXELS_2048;
}

/** Stars per million pixels of stage. Enough to read as a sky, few enough to stay quiet. */
const STAR_DENSITY = 190;

/** Fetch and decode a photograph; null if it never arrives. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** The first source that decodes, so a newer format can be offered with an older one behind it. */
async function loadFirst(sources: readonly string[]): Promise<HTMLImageElement | null> {
  for (const src of sources) {
    const image = await loadImage(src);
    if (image) return image;
  }
  return null;
}

/** The raw pixels of a photograph, for the processor-side fallback renderer. */
function pixelsOf(img: HTMLImageElement): Texture | null {
  const store = document.createElement("canvas");
  store.width = img.naturalWidth;
  store.height = img.naturalHeight;
  const ctx = store.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  const pixels = ctx.getImageData(0, 0, store.width, store.height);
  return { data: pixels.data, width: store.width, height: store.height };
}

/**
 * A fixed field of stars for a given stage size. Deterministic, so it does not shimmer between
 * frames, and drawn once into an offscreen canvas that is then just blitted.
 */
function paintStars(width: number, height: number, colour: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  // A small deterministic generator: the same stage always gets the same sky.
  let seed = 0x9e3779b9;
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const count = Math.round((width * height * STAR_DENSITY) / 1_000_000);
  ctx.fillStyle = colour;
  for (let i = 0; i < count; i++) {
    const x = random() * width;
    const y = random() * height;
    const r = 0.35 + random() * 0.85;
    ctx.globalAlpha = 0.25 + random() * 0.65;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return canvas;
}
/** No uncertainty circle is ever drawn smaller than this; below it the reader cannot see there is one. */
const MIN_UNCERTAINTY_PX = 22;
/** How far the active place may drift from the centre before the card stops claiming to point at it. */
const OFF_CENTRE_PX = 40;
const TURN_MS = 1100;

type Palette = {
  sphere: string;
  sphereEdge: string;
  halo: string;
  star: string;
  accent: string;
  muted: string;
  marker: string;
  markerQuiet: string;
  markerOutline: string;
  trail: string;
};

function readPalette(el: HTMLElement): Palette {
  const s = getComputedStyle(el);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    sphere: v("--globe-sphere", "#2e2b25"),
    sphereEdge: v("--globe-sphere-edge", "#3b372f"),
    halo: v("--globe-halo", "rgba(150, 180, 220, 0.10)"),
    star: v("--globe-star", "rgba(255, 253, 245, 0.85)"),
    accent: v("--accent", "#f6a06b"),
    muted: v("--text-muted", "#c0b6a5"),
    marker: v("--globe-marker", "#ff4436"),
    markerQuiet: v("--globe-marker-quiet", "#d8483f"),
    markerOutline: v("--globe-marker-outline", "rgba(0, 0, 0, 0.6)"),
    trail: v("--globe-trail", "rgba(255, 176, 150, 0.55)"),
  };
}

/**
 * The globe. A photograph of the Earth that always turns the active event's place to the centre.
 *
 * Two canvases, one on top of the other. The lower one is WebGL2 and draws only the sphere
 * (lib/globe/webgl); the upper one is Canvas 2D and draws everything else: the sky, the road,
 * the pins, the uncertainty rings. Where WebGL2 is missing or its context is lost, the upper
 * canvas draws the sphere itself, one pixel at a time (lib/globe/sphere), and the page looks the
 * same, only slower to turn. The animation frame only runs while the camera is moving.
 *
 * Both canvases are aria-hidden: everything they show is also in the DOM around them (the card,
 * the place name, the buttons). A reader who cannot see them loses nothing.
 */
export function Globe({ places, activeIndex, trailTo, recenterKey = 0, onSelect, onOffCentreChange, ariaLabel, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, dpr: 1 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const active = places[activeIndex];
  /** Null when nothing is being pointed at: an event with no single place has nowhere to aim. */
  const target: Centre | null = useMemo(
    () => (active ? { lng: active.lng, lat: active.lat } : null),
    [active],
  );
  /** How far along the road we are; held over an event with no place so the road does not vanish. */
  const road = trailTo ?? activeIndex;

  // The camera lives in a ref: it changes every frame and must not re-render React.
  const opening = target ?? { lng: 20, lat: 20 };
  const camera = useRef<{ from: Centre; to: Centre; startedAt: number; duration: number; current: Centre }>({
    from: opening, to: opening, startedAt: 0, duration: 0, current: opening,
  });
  const paletteRef = useRef<Palette | null>(null);
  /** Set while a finger or the mouse is turning the globe by hand. */
  const dragRef = useRef<{ pointerId: number; x: number; y: number; moved: number } | null>(null);
  const offCentreRef = useRef(false);
  /** Wakes the render loop. It stops itself when the globe settles, so a hand-turn must restart it. */
  const requestDrawRef = useRef<() => void>(() => {});
  /** Hands a freshly loaded photograph to whichever renderer is in use. */
  const adoptRef = useRef<(image: HTMLImageElement) => void>(() => {});
  /** The graphics card, when there is one to be had. Null means the fallback renderer. */
  const glRef = useRef<GlobeGl | null>(null);
  /** The latest photograph to arrive, so a restored WebGL context can be given it again. */
  const imageRef = useRef<HTMLImageElement | null>(null);
  /** The photograph as raw pixels, fallback only. Null until it has loaded; the globe draws plain until then. */
  const textureRef = useRef<Texture | null>(null);
  /** Reused between frames: allocating a megabyte of pixels sixty times a second is not free. */
  const sphereRef = useRef<{ canvas: HTMLCanvasElement; image: ImageData; size: number } | null>(null);
  const starsRef = useRef<{ canvas: HTMLCanvasElement; width: number; height: number } | null>(null);
  /** The sharper photograph is asked for at most once. */
  const upgradedRef = useRef(false);
  /** Great-circle points for every leg of the journey, worked out once per set of places. */
  const trailRef = useRef<{ places: GlobePlace[]; legs: Array<Array<[number, number]>> } | null>(null);
  const hitsRef = useRef<Array<{ index: number; x: number; y: number }>>([]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height, dpr: Math.min(2, window.devicePixelRatio || 1) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The graphics card. Set up before the photograph is asked for, so the first frame with a
  // texture is already the fast path. A lost context falls back to the processor until it is
  // restored, and the page never notices either way.
  useEffect(() => {
    const el = glCanvasRef.current;
    if (!el) return;
    const adopt = (image: HTMLImageElement) => {
      const gl = glRef.current;
      if (gl && gl.setTexture(image)) textureRef.current = null;
      else textureRef.current = pixelsOf(image);
      sphereRef.current = null;
    };
    const start = () => {
      glRef.current = createGlobeGl(el);
      if (imageRef.current) adopt(imageRef.current);
      requestDrawRef.current();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      glRef.current = null;
      if (imageRef.current) adopt(imageRef.current);
      requestDrawRef.current();
    };
    el.addEventListener("webglcontextlost", onLost);
    el.addEventListener("webglcontextrestored", start);
    start();
    adoptRef.current = adopt;
    return () => {
      el.removeEventListener("webglcontextlost", onLost);
      el.removeEventListener("webglcontextrestored", start);
      glRef.current?.dispose();
      glRef.current = null;
      adoptRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // A failure needs no handling: the plain lit ball is already the answer, and the pins, the
    // card and every button keep working without the photograph.
    loadFirst(EARTH_TEXTURE).then((image) => {
      if (cancelled || !image || imageRef.current) return;
      imageRef.current = image;
      adoptRef.current(image);
      requestDrawRef.current();
    });
    return () => { cancelled = true; };
  }, []);

  // The sharper photograph, once the small one is already on screen and the screen warrants it.
  useEffect(() => {
    if (upgradedRef.current || !wantsSharperEarth(size.width, size.height, size.dpr)) return;
    upgradedRef.current = true;
    let cancelled = false;
    loadFirst(EARTH_TEXTURE_HIGH).then((image) => {
      if (cancelled || !image) return;
      imageRef.current = image;
      adoptRef.current(image);
      requestDrawRef.current();
    });
    return () => { cancelled = true; };
  }, [size]);

  // A new active event starts a turn. Readers who asked for less motion get the new view at once.
  useEffect(() => {
    // Nothing to aim at: the globe holds the view it has rather than swinging off to a made-up spot.
    if (!target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cam = camera.current;
    cam.from = cam.current;
    cam.to = target;
    cam.startedAt = performance.now();
    cam.duration = reduced ? 0 : TURN_MS;
    // The loop stops itself once the globe settles, so every new aim has to wake it.
    requestDrawRef.current();
  }, [target, recenterKey]);

  useEffect(() => {
    let frame: number | null = null;

    const draw = () => {
    frame = null;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || size.width === 0) return;

    if (!paletteRef.current) paletteRef.current = readPalette(canvas);
    const palette = paletteRef.current;

    const cam = camera.current;
    const elapsed = performance.now() - cam.startedAt;
    const t = cam.duration === 0 ? 1 : Math.min(1, elapsed / cam.duration);
    cam.current = interpolateCentre(cam.from, cam.to, easeInOutCubic(t));
    const centre = cam.current;

    const { width, height, dpr } = size;
    const layout = layoutFor(width);
    const cx = width * layout.focusX;
    const cy = height * layout.focusY;
    const radius = Math.min(width, height) * layout.radiusScale;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // The sky. Repainted only when the stage changes size, and kept out of the disc: the sphere
    // may be on the canvas underneath this one, and stars do not shine through the Earth.
    let stars = starsRef.current;
    if (!stars || stars.width !== width || stars.height !== height) {
      stars = { canvas: paintStars(width, height, palette.star), width, height };
      starsRef.current = stars;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.drawImage(stars.canvas, 0, 0, width, height);
    ctx.restore();

    // A soft glow just outside the limb, fading to nothing: it separates the globe from the page
    // without drawing a ring around the photograph.
    const glow = ctx.createRadialGradient(cx, cy, radius, cx, cy, radius * 1.11);
    glow.addColorStop(0, palette.halo);
    glow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.11, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    const gl = glRef.current;
    const texture = textureRef.current;
    if (gl?.hasTexture()) {
      // The card draws the sphere on the canvas underneath, at full resolution every frame.
      gl.render({ centre, cx: cx * dpr, cy: cy * dpr, radius: radius * dpr, width: Math.round(width * dpr), height: Math.round(height * dpr) });
    } else if (texture) {
      // Fallback: drawn smaller while it turns and scaled up, full size once it settles.
      const moving = t < 1 || dragRef.current !== null;
      const n = Math.max(16, Math.round(radius * 2 * (moving ? MOVING_QUALITY : 1)));
      let sphere = sphereRef.current;
      if (!sphere || sphere.size !== n) {
        const canvas2 = document.createElement("canvas");
        canvas2.width = n;
        canvas2.height = n;
        const sctx = canvas2.getContext("2d");
        if (!sctx) return;
        sphere = { canvas: canvas2, image: sctx.createImageData(n, n), size: n };
        sphereRef.current = sphere;
      }
      renderSphere(sphere.image.data, n, texture, centre, !moving);
      sphere.canvas.getContext("2d")?.putImageData(sphere.image, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sphere.canvas, cx - radius, cy - radius, radius * 2, radius * 2);
    } else {
      // Until the photograph arrives: a lit ball, so the page never shows an empty hole.
      gl?.render({ centre, cx: 0, cy: 0, radius: 0, width: Math.round(width * dpr), height: Math.round(height * dpr) });
      const plain = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      plain.addColorStop(0, palette.sphereEdge);
      plain.addColorStop(1, palette.sphere);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = plain;
      ctx.fill();
    }

    // Pins, and the dashed ring that admits we only know the area (ADR-025).
    // The road travelled, from the first event to this one. It follows the active index rather
    // than where the reader has been, so a shared link shows the same road as a walk to it does,
    // and going back really does unwind it. Only the near side is drawn: the far side is behind
    // the Earth, which is exactly how a road around a sphere should read.
    if (road > 0) {
      let trail = trailRef.current;
      if (!trail || trail.places !== places) {
        const legs: Array<Array<[number, number]>> = [];
        for (let i = 1; i < places.length; i++) {
          legs.push(greatCirclePath(places[i - 1].lng, places[i - 1].lat, places[i].lng, places[i].lat, 40));
        }
        trail = { places, legs };
        trailRef.current = trail;
      }
      ctx.strokeStyle = palette.trail;
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      for (let leg = 0; leg < road; leg++) {
        // Older legs are quieter, so the eye is drawn along the road to where it is standing.
        const recency = (leg + 1) / road;
        const arriving = leg === road - 1;
        ctx.globalAlpha = (0.2 + 0.8 * recency) * (arriving ? t : 1);
        ctx.beginPath();
        let started = false;
        for (const [lng, lat] of trail.legs[leg]) {
          const tp = project(lng, lat, centre, radius, cx, cy);
          if (!tp.visible) { started = false; continue; }
          if (started) ctx.lineTo(tp.x, tp.y); else { ctx.moveTo(tp.x, tp.y); started = true; }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    const hits: Array<{ index: number; x: number; y: number }> = [];
    let activePlaceHidden = false;
    places.forEach((place, index) => {
      const p = project(place.lng, place.lat, centre, radius, cx, cy);
      if (!p.visible) {
        if (index === activeIndex) activePlaceHidden = true;
        return;
      }
      const isActive = index === activeIndex;
      const colour = isActive ? palette.marker : palette.markerQuiet;
      const uncertainty = PLACE_RADIUS_KM[place.placePrecision];

      if (uncertainty !== null) {
        // Real kilometres, unless that would come out too small to see at this size.
        const drawKm = Math.max(uncertainty, (MIN_UNCERTAINTY_PX / radius) * EARTH_RADIUS_KM);
        const ring = circlePath(place.lng, place.lat, drawKm);
        const trace = () => {
          let started = false;
          ctx.beginPath();
          for (const [lng, lat] of ring) {
            const rp = project(lng, lat, centre, radius, cx, cy);
            if (!rp.visible) { started = false; continue; }
            if (started) ctx.lineTo(rp.x, rp.y); else { ctx.moveTo(rp.x, rp.y); started = true; }
          }
        };
        ctx.setLineDash([4, 4]);
        // A dark line under the dashes, so they survive a pale desert as well as a dark ocean.
        trace();
        ctx.strokeStyle = palette.markerOutline;
        ctx.globalAlpha = isActive ? 0.6 : 0.25;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        trace();
        ctx.strokeStyle = colour;
        ctx.globalAlpha = isActive ? 0.9 : 0.35;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const r = isActive ? 5 : index === hovered ? 4 : 2.8;
      ctx.globalAlpha = isActive ? 1 : 0.45 + 0.35 * Math.max(0, p.depth);
      // Outline first, fill second: this is what makes a pin findable on any terrain.
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 1.3, 0, Math.PI * 2);
      ctx.fillStyle = palette.markerOutline;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = colour;
      ctx.fill();

      if (isActive) {
        // A soft halo and, where no uncertainty ring already says so, a thin circle around it.
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = palette.marker;
        ctx.fill();
        if (uncertainty === null) {
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
          ctx.strokeStyle = palette.marker;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      hits.push({ index, x: p.x, y: p.y });
      if (isActive) {
        // The strip offers to turn the globe back once the reader has dragged the active place
        // away from the middle of the disc, or over the horizon.
        const off = Math.hypot(p.x - cx, p.y - cy) > OFF_CENTRE_PX;
        if (off !== offCentreRef.current) {
          offCentreRef.current = off;
          onOffCentreChange?.(off);
        }
      }
    });
    hitsRef.current = hits;
    // The active place can also be on the far side, which counts as off centre.
    if (activePlaceHidden && !offCentreRef.current) {
      offCentreRef.current = true;
      onOffCentreChange?.(true);
    }

    // Frames run while the camera is moving or while a hand is on the globe; a settled,
    // untouched globe costs nothing.
    if (t < 1 || dragRef.current) frame = requestAnimationFrame(draw);
    };

    const request = () => {
      if (frame === null) frame = requestAnimationFrame(draw);
    };
    requestDrawRef.current = request;
    request();
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      requestDrawRef.current = () => {};
    };
  }, [activeIndex, hovered, onOffCentreChange, places, road, size]);

  /** Degrees of rotation per pixel dragged, so the point under the finger roughly keeps up. */
  const dragScale = (radiusPx: number) => 180 / Math.PI / Math.max(1, radiusPx);

  const startDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: 0 };
    // Whatever turn was in flight stops here; the globe is the reader's now.
    const cam = camera.current;
    cam.from = cam.current;
    cam.to = cam.current;
    cam.duration = 0;
    setDragging(true);
    requestDrawRef.current();
  };

  const moveDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.moved += Math.hypot(dx, dy);

    const layout = layoutFor(size.width);
    const scale = dragScale(Math.min(size.width, size.height) * layout.radiusScale);
    const cam = camera.current;
    const next = {
      lng: ((cam.current.lng - dx * scale + 540) % 360) - 180,
      // Stop just short of the poles: at 90 degrees the globe has no "up" left to turn towards.
      lat: Math.max(-89, Math.min(89, cam.current.lat + dy * scale)),
    };
    cam.current = next;
    cam.from = next;
    cam.to = next;
    requestDrawRef.current();
  };

  const endDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (!drag || drag.pointerId !== event.pointerId) return;
    // A press that barely moved is a click on a pin, not a turn of the globe.
    if (drag.moved < 5) {
      const index = nearestPin(event);
      if (index !== null && onSelect) onSelect(index);
    }
  };

  const nearestPin = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let best: { index: number; d: number } | null = null;
    for (const hit of hitsRef.current) {
      const d = Math.hypot(hit.x - x, hit.y - y);
      if (d < 14 && (!best || d < best.d)) best = { index: hit.index, d };
    }
    return best?.index ?? null;
  };

  return (
    <>
      {/* The sphere, by the graphics card. Under the drawing canvas, which takes the pointer. */}
      <canvas
        ref={glCanvasRef}
        aria-hidden
        width={Math.round(size.width * size.dpr)}
        height={Math.round(size.height * size.dpr)}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    <canvas
      ref={canvasRef}
      aria-hidden
      role="presentation"
      data-label={ariaLabel}
      width={Math.round(size.width * size.dpr)}
      height={Math.round(size.height * size.dpr)}
      onPointerDown={startDrag}
      onPointerMove={(e) => {
        if (dragRef.current) moveDrag(e);
        else setHovered(nearestPin(e));
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={() => setHovered(null)}
      // Absolute with an explicit size, both of which are needed. In normal flow the stage is a
      // flex item, so a percentage height on a child collapses to zero; and a canvas is a replaced
      // element, so inset-0 alone would leave it at its intrinsic size (the width/height
      // attributes, which start at zero) instead of stretching. Absolute also puts it under the card.
      className={`absolute inset-0 h-full w-full touch-none ${dragging ? "cursor-grabbing" : hovered !== null ? "cursor-pointer" : "cursor-grab"} ${className ?? ""}`}
    />
    </>
  );
}

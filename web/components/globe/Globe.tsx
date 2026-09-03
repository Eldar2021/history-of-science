"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { layoutFor } from "@/lib/globe/layout";
import { renderSphere, type Texture } from "@/lib/globe/sphere";
import { circlePath, EARTH_RADIUS_KM, easeInOutCubic, interpolateCentre, project, type Centre } from "@/lib/globe/projection";
import { PLACE_RADIUS_KM } from "@/lib/i18n/formatPlace";
import type { GlobePlace } from "@/lib/globe/events";

type Props = {
  places: GlobePlace[];
  /** Index into `places` that must sit in the centre of the disc. */
  activeIndex: number;
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
 * NASA's Blue Marble: land surface, shallow water and shaded topography, 2048 x 1024, 238 KB.
 * Source: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57752/land_shallow_topo_2048.jpg
 * NASA Earth science imagery is not copyrighted and carries no usage restriction; NASA asks only
 * to be credited, which the page does under the globe. See doc/09 ADR-026.
 */
const EARTH_TEXTURE = "/globe/earth-2048.jpg";
/**
 * Fraction of full resolution to draw at while the globe is turning. Every pixel of the disc costs
 * an arcsine and an arctangent, so a moving globe is drawn smaller and scaled up; it settles at
 * full resolution on the last frame, which is the one anybody looks at.
 */
const MOVING_QUALITY = 0.55;
/** Stars per million pixels of stage. Enough to read as a sky, few enough to stay quiet. */
const STAR_DENSITY = 190;

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
  disciplines: Map<string, string>;
};

function readPalette(el: HTMLElement, disciplines: string[]): Palette {
  const s = getComputedStyle(el);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    sphere: v("--globe-sphere", "#2e2b25"),
    sphereEdge: v("--globe-sphere-edge", "#3b372f"),
    halo: v("--globe-halo", "rgba(150, 180, 220, 0.10)"),
    star: v("--globe-star", "rgba(255, 253, 245, 0.85)"),
    accent: v("--accent", "#f6a06b"),
    muted: v("--text-muted", "#c0b6a5"),
    disciplines: new Map(disciplines.map((d) => [d, v(`--discipline-${d}`, "#a7aeb3")])),
  };
}

/**
 * The globe. A sphere of land dots that always turns the active event's place to the centre.
 *
 * Canvas 2D on purpose: the projection is a dozen lines of trigonometry (lib/globe/projection),
 * so there is no WebGL context to lose, no shader to fall back from, and the whole thing works
 * with the browser's own rendering. The animation frame only runs while the camera is moving.
 *
 * The canvas is aria-hidden: everything it shows is also in the DOM around it (the card, the
 * place name, the buttons). A reader who cannot see it loses nothing.
 */
export function Globe({ places, activeIndex, recenterKey = 0, onSelect, onOffCentreChange, ariaLabel, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, dpr: 1 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const active = places[activeIndex];
  const target: Centre = useMemo(
    () => (active ? { lng: active.lng, lat: active.lat } : { lng: 20, lat: 20 }),
    [active],
  );


  // The camera lives in a ref: it changes every frame and must not re-render React.
  const camera = useRef<{ from: Centre; to: Centre; startedAt: number; duration: number; current: Centre }>({
    from: target, to: target, startedAt: 0, duration: 0, current: target,
  });
  const paletteRef = useRef<Palette | null>(null);
  /** Set while a finger or the mouse is turning the globe by hand. */
  const dragRef = useRef<{ pointerId: number; x: number; y: number; moved: number } | null>(null);
  const offCentreRef = useRef(false);
  /** Wakes the render loop. It stops itself when the globe settles, so a hand-turn must restart it. */
  const requestDrawRef = useRef<() => void>(() => {});
  /** The photograph, as raw pixels. Null until it has loaded; the globe draws plain until then. */
  const textureRef = useRef<Texture | null>(null);
  /** Reused between frames: allocating a megabyte of pixels sixty times a second is not free. */
  const sphereRef = useRef<{ canvas: HTMLCanvasElement; image: ImageData; size: number } | null>(null);
  const starsRef = useRef<{ canvas: HTMLCanvasElement; width: number; height: number } | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      const store = document.createElement("canvas");
      store.width = img.naturalWidth;
      store.height = img.naturalHeight;
      const sctx = store.getContext("2d");
      if (!sctx) return;
      sctx.drawImage(img, 0, 0);
      const pixels = sctx.getImageData(0, 0, store.width, store.height);
      textureRef.current = { data: pixels.data, width: store.width, height: store.height };
      requestDrawRef.current();
    };
    // No onerror handling on purpose: the plain lit ball is already the answer, and the pins,
    // the card and every button keep working without the photograph.
    img.src = EARTH_TEXTURE;
    return () => { cancelled = true; };
  }, []);

  // A new active event starts a turn. Readers who asked for less motion get the new view at once.
  useEffect(() => {
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

    if (!paletteRef.current) paletteRef.current = readPalette(canvas, places.map((p) => p.discipline));
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

    // The sky. Repainted only when the stage changes size.
    let stars = starsRef.current;
    if (!stars || stars.width !== width || stars.height !== height) {
      stars = { canvas: paintStars(width, height, palette.star), width, height };
      starsRef.current = stars;
    }
    ctx.drawImage(stars.canvas, 0, 0, width, height);

    // A soft glow just outside the limb, fading to nothing: it separates the globe from the page
    // without drawing a ring around the photograph.
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.97, cx, cy, radius * 1.11);
    glow.addColorStop(0, palette.halo);
    glow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.11, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    const texture = textureRef.current;
    if (texture) {
      // Drawn smaller while it turns and scaled up, full size once it settles.
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
      renderSphere(sphere.image.data, n, texture, centre);
      sphere.canvas.getContext("2d")?.putImageData(sphere.image, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sphere.canvas, cx - radius, cy - radius, radius * 2, radius * 2);
    } else {
      // Until the photograph arrives: a lit ball, so the page never shows an empty hole.
      const plain = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      plain.addColorStop(0, palette.sphereEdge);
      plain.addColorStop(1, palette.sphere);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = plain;
      ctx.fill();
    }

    // Pins, and the dashed ring that admits we only know the area (ADR-025).
    const hits: Array<{ index: number; x: number; y: number }> = [];
    let activePlaceHidden = false;
    places.forEach((place, index) => {
      const p = project(place.lng, place.lat, centre, radius, cx, cy);
      if (!p.visible) {
        if (index === activeIndex) activePlaceHidden = true;
        return;
      }
      const isActive = index === activeIndex;
      const colour = palette.disciplines.get(place.discipline) ?? palette.muted;
      const uncertainty = PLACE_RADIUS_KM[place.placePrecision];

      if (uncertainty !== null) {
        ctx.beginPath();
        // Real kilometres, unless that would come out too small to see at this size.
        const drawKm = Math.max(uncertainty, (MIN_UNCERTAINTY_PX / radius) * EARTH_RADIUS_KM);
        const ring = circlePath(place.lng, place.lat, drawKm);
        let started = false;
        for (const [lng, lat] of ring) {
          const rp = project(lng, lat, centre, radius, cx, cy);
          if (!rp.visible) { started = false; continue; }
          if (started) ctx.lineTo(rp.x, rp.y); else { ctx.moveTo(rp.x, rp.y); started = true; }
        }
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = colour;
        ctx.globalAlpha = isActive ? 0.7 : 0.25;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.globalAlpha = isActive ? 1 : 0.35 + 0.4 * Math.max(0, p.depth);
      ctx.beginPath();
      ctx.arc(p.x, p.y, isActive ? 5 : index === hovered ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? palette.accent : colour;
      ctx.fill();
      if (isActive && uncertainty === null) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      hits.push({ index, x: p.x, y: p.y });
      if (isActive) {
        // The card's tail points at the middle of the disc. Once the reader has turned the globe
        // away from the active place, that is no longer where the pin is, and the card must stop
        // claiming otherwise.
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
  }, [activeIndex, hovered, onOffCentreChange, places, size]);

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
  );
}

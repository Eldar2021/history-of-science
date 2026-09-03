"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { landDots } from "@/lib/globe/dots";
import { layoutFor } from "@/lib/globe/layout";
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

/** Degrees between land dots. Smaller is denser; 1.3 gives roughly eight thousand. */
const DOT_SPACING_DEG = 1.3;
/** No uncertainty circle is ever drawn smaller than this; below it the reader cannot see there is one. */
const MIN_UNCERTAINTY_PX = 22;
/** How far the active place may drift from the centre before the card stops claiming to point at it. */
const OFF_CENTRE_PX = 40;
/**
 * Depth bands, front to back. A dot facing us is full size and bright; one near the limb is
 * smaller, dimmer and drawn in the far colour. Ordered from nearest, matched first.
 */
const DEPTH_BANDS = [
  { minDepth: 0.72, scale: 1, alpha: 1 },
  { minDepth: 0.42, scale: 0.85, alpha: 0.85 },
  { minDepth: 0.18, scale: 0.7, alpha: 0.6 },
  { minDepth: 0, scale: 0.55, alpha: 0.4 },
];
const TURN_MS = 1100;

type Palette = {
  sphere: string;
  sphereEdge: string;
  dot: string;
  dotFar: string;
  halo: string;
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
    dot: v("--globe-dot", "#6f6857"),
    dotFar: v("--globe-dot-far", "#5d5849"),
    halo: v("--globe-halo", "rgba(156, 146, 124, 0.16)"),
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
  /** Built on the first paint in the browser, never during server rendering. */
  const dotsRef = useRef<Float32Array | null>(null);
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
    if (!dotsRef.current) dotsRef.current = landDots(DOT_SPACING_DEG);
    const palette = paletteRef.current;
    const dots = dotsRef.current;

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

    // A thin halo just outside the limb: without it the sphere's edge disappears into the page.
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.035, 0, Math.PI * 2);
    ctx.strokeStyle = palette.halo;
    ctx.lineWidth = radius * 0.07;
    ctx.stroke();

    // The sphere: a little brighter where it faces us, so it reads as a ball and not a circle.
    const sphere = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
    sphere.addColorStop(0, palette.sphereEdge);
    sphere.addColorStop(1, palette.sphere);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = sphere;
    ctx.fill();

    // Land. Dots are sorted into depth bands and each band is drawn once: nearer bands are
    // bigger and brighter, so the field foreshortens toward the limb the way a sphere does.
    // One fill per band instead of one per dot keeps this cheap.
    const dotRadius = Math.max(0.75, radius / 205);
    const bands = DEPTH_BANDS.map(() => new Path2D());
    for (let i = 0; i < dots.length; i += 2) {
      const p = project(dots[i], dots[i + 1], centre, radius, cx, cy);
      if (!p.visible) continue;
      let band = DEPTH_BANDS.length - 1;
      for (let b = 0; b < DEPTH_BANDS.length; b++) {
        if (p.depth >= DEPTH_BANDS[b].minDepth) { band = b; break; }
      }
      const r = dotRadius * DEPTH_BANDS[band].scale;
      bands[band].moveTo(p.x + r, p.y);
      bands[band].arc(p.x, p.y, r, 0, Math.PI * 2);
    }
    for (let b = bands.length - 1; b >= 0; b--) {
      ctx.globalAlpha = DEPTH_BANDS[b].alpha;
      ctx.fillStyle = b === 0 ? palette.dot : palette.dotFar;
      ctx.fill(bands[b]);
    }
    ctx.globalAlpha = 1;

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

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
  /** Label for assistive technology; the canvas itself carries no information. */
  ariaLabel?: string;
  className?: string;
};

/** Degrees between land dots. Smaller is denser; 1.3 gives roughly eight thousand. */
const DOT_SPACING_DEG = 1.3;
/** No uncertainty circle is ever drawn smaller than this; below it the reader cannot see there is one. */
const MIN_UNCERTAINTY_PX = 22;
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
export function Globe({ places, activeIndex, onSelect, ariaLabel, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, dpr: 1 });
  const [hovered, setHovered] = useState<number | null>(null);

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
  }, [target]);

  useEffect(() => {
    let frame: number | null = null;

    const draw = () => {
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

    // Land, in two passes so dots fade toward the rim without a fill per dot.
    const dotRadius = Math.max(0.75, radius / 210);
    const near = new Path2D();
    const far = new Path2D();
    for (let i = 0; i < dots.length; i += 2) {
      const p = project(dots[i], dots[i + 1], centre, radius, cx, cy);
      if (!p.visible) continue;
      const path = p.depth > 0.45 ? near : far;
      path.moveTo(p.x + dotRadius, p.y);
      path.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
    }
    ctx.fillStyle = palette.dotFar;
    ctx.fill(far);
    ctx.fillStyle = palette.dot;
    ctx.fill(near);

    // Pins, and the dashed ring that admits we only know the area (ADR-025).
    const hits: Array<{ index: number; x: number; y: number }> = [];
    places.forEach((place, index) => {
      const p = project(place.lng, place.lat, centre, radius, cx, cy);
      if (!p.visible) return;
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
    });
    hitsRef.current = hits;

    // Frames only run while the camera is moving; a settled globe costs nothing.
    if (t < 1) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [activeIndex, hovered, places, size]);

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
      onPointerMove={(e) => setHovered(nearestPin(e))}
      onPointerLeave={() => setHovered(null)}
      onClick={(e) => {
        const index = nearestPin(e as unknown as React.PointerEvent<HTMLCanvasElement>);
        if (index !== null && onSelect) onSelect(index);
      }}
      // Absolute with an explicit size, both of which are needed. In normal flow the stage is a
      // flex item, so a percentage height on a child collapses to zero; and a canvas is a replaced
      // element, so inset-0 alone would leave it at its intrinsic size (the width/height
      // attributes, which start at zero) instead of stretching. Absolute also puts it under the card.
      className={`absolute inset-0 h-full w-full ${hovered !== null ? "cursor-pointer" : ""} ${className ?? ""}`}
    />
  );
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatYear, type Locale } from "@/lib/i18n/formatYear";
import { TIMELINE_END, TIMELINE_START, xScaleInvert, yearToUnit } from "@/lib/timeline/xScale";
import { closestIndex, densityBins } from "@/lib/timeline/minimap";

type EraMark = { slug: string; start_year: number };
type Props = {
  /** Years of the cards in document order. */
  years: number[];
  slugs: string[];
  eras: EraMark[];
  locale: Locale;
  orientation: "horizontal" | "vertical";
  className?: string;
  label: string;
};

const BINS = { horizontal: 72, vertical: 56 } as const;
const pct = (u: number) => `${Math.min(100, Math.max(0, u * 100))}%`;

/**
 * The real-scale minimap (doc/05): density of events along the axis from xScale, era ticks, the band of
 * years on screen and a cursor at the live year. Clicking (or dragging) jumps to the nearest event.
 * One instance per orientation: a bottom strip on phones, a right-hand column on desktop.
 */
export function Minimap({ years, slugs, eras, locale, orientation, className = "", label }: Props) {
  const vertical = orientation === "vertical";
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState(years[0] ?? TIMELINE_START);
  const [band, setBand] = useState<[number, number]>([years[0] ?? TIMELINE_START, years[0] ?? TIMELINE_START]);
  const bins = useMemo(() => densityBins(years, BINS[orientation]), [years, orientation]);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-year]"));
      if (!cards.length) return;
      const line = window.innerHeight * 0.45;
      let lo = Infinity, hi = -Infinity, at: number | undefined, nearest = Infinity;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        if (r.height === 0) continue; // hidden by the discipline filter
        const y = Number(c.dataset.year);
        if (r.bottom > 0 && r.top < window.innerHeight) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
        const d = r.top <= line && r.bottom >= line ? 0 : Math.min(Math.abs(r.top - line), Math.abs(r.bottom - line));
        if (d < nearest) { nearest = d; at = y; }
      }
      if (at !== undefined) setCursor(at);
      if (lo !== Infinity) setBand([lo, hi]);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(frame); };
  }, []);

  function scrollToIndex(i: number) {
    const target = document.getElementById(`event-${slugs[Math.min(years.length - 1, Math.max(0, i))]}`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({ block: "start", behavior: reduce ? "instant" : "smooth" });
  }

  function jump(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current!.getBoundingClientRect();
    const frac = vertical ? (e.clientY - rect.top) / rect.height : (e.clientX - rect.left) / rect.width;
    scrollToIndex(closestIndex(years, xScaleInvert(Math.min(1, Math.max(0, frac)))));
  }

  /** Keyboard: arrows step to the previous/next event, Home/End to the ends (doc/05: everything works by keyboard). */
  function onKey(e: React.KeyboardEvent<SVGSVGElement>) {
    const at = closestIndex(years, cursor);
    const step: Record<string, number | undefined> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key === "Home") scrollToIndex(0);
    else if (e.key === "End") scrollToIndex(years.length - 1);
    else if (step[e.key] !== undefined) scrollToIndex(at + step[e.key]!);
    else return;
    e.preventDefault();
  }

  const desc = `${label}: ${formatYear(TIMELINE_START, "exact", locale)} - ${formatYear(TIMELINE_END, "exact", locale)}`;
  const u = (y: number) => yearToUnit(y);

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        role="slider"
        tabIndex={0}
        aria-label={desc}
        aria-orientation={orientation}
        aria-valuemin={TIMELINE_START}
        aria-valuemax={TIMELINE_END}
        aria-valuenow={cursor}
        aria-valuetext={formatYear(cursor, "exact", locale)}
        onKeyDown={onKey}
        onPointerDown={jump}
        onPointerMove={(e) => { if (e.buttons === 1) jump(e); }}
        className="h-full w-full cursor-pointer touch-none select-none overflow-visible rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {/* on-screen band */}
        {vertical
          ? <rect x="0" width="100%" y={pct(u(band[0]))} height={pct(Math.max(0.004, u(band[1]) - u(band[0])))} fill="var(--accent)" opacity="0.18" />
          : <rect y="0" height="100%" x={pct(u(band[0]))} width={pct(Math.max(0.004, u(band[1]) - u(band[0])))} fill="var(--accent)" opacity="0.18" />}
        {/* density */}
        {bins.map((v, i) => v > 0 && (vertical
          ? <rect key={i} x="0" width={pct(v)} y={pct(i / bins.length)} height={pct(1 / bins.length)} fill="var(--accent)" opacity="0.55" />
          : <rect key={i} y={pct(1 - v)} height={pct(v)} x={pct(i / bins.length)} width={pct(1 / bins.length)} fill="var(--accent)" opacity="0.55" />))}
        {/* era ticks */}
        {eras.map((er) => (vertical
          ? <line key={er.slug} x1="0" x2="100%" y1={pct(u(er.start_year))} y2={pct(u(er.start_year))} stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
          : <line key={er.slug} y1="0" y2="100%" x1={pct(u(er.start_year))} x2={pct(u(er.start_year))} stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />))}
        {/* cursor */}
        {vertical
          ? <line x1="0" x2="100%" y1={pct(u(cursor))} y2={pct(u(cursor))} stroke="var(--accent)" strokeWidth="2" />
          : <line y1="0" y2="100%" x1={pct(u(cursor))} x2={pct(u(cursor))} stroke="var(--accent)" strokeWidth="2" />}
        {vertical
          ? <circle cx="100%" cy={pct(u(cursor))} r="4" fill="var(--accent)" />
          : <circle cy="100%" cx={pct(u(cursor))} r="4" fill="var(--accent)" />}
      </svg>
    </div>
  );
}

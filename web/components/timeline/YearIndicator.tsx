"use client";
import { useEffect, useRef, useState } from "react";
import { formatYear, type Locale } from "@/lib/i18n/formatYear";

type Props = { locale: Locale; initialYear: number; initialEra?: string };

/**
 * Live year in the top bar. Watches every [data-year] card and shows the one crossing
 * the middle band of the viewport. The visible number ticks immediately; screen readers hear the year
 * only once scrolling settles (aria-live with a debounce).
 */
export function YearIndicator({ locale, initialYear, initialEra }: Props) {
  const [year, setYear] = useState(initialYear);
  const [era, setEra] = useState(initialEra ?? "");
  const [announced, setAnnounced] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-year]"));
    if (cards.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the entry that just entered the band; on fast scrolls several may report at once.
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const el = hit.target as HTMLElement;
        const y = Number(el.dataset.year);
        if (!Number.isNaN(y)) setYear(y);
        setEra(el.dataset.era ?? "");
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.5, 1] },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAnnounced(formatYear(year, "exact", locale)), 600);
    return () => window.clearTimeout(timer.current);
  }, [year, locale]);

  const label = formatYear(year, "exact", locale);

  return (
    <div className="flex items-baseline gap-3">
      <span aria-hidden className="font-display text-[1.75rem] leading-none tabular tracking-tight text-primary sm:text-year-bar">
        {/* Re-mounting on change replays the tick animation; reduced-motion sets its duration to 0. */}
        <span key={label} className="inline-block animate-tick">{label}</span>
      </span>
      {era && <span className="hidden font-display text-small text-sage sm:inline">{era}</span>}
      <span className="sr-only" aria-live="polite">{announced}</span>
    </div>
  );
}

"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * `?year=1687` (02-spec): lands the reader on the event closest to that year. Runs on the client so the
 * page stays static; the YearIndicator then picks the card up through its observer.
 */
export function DeepLink() {
  const params = useSearchParams();
  const raw = params.get("year");

  useEffect(() => {
    if (raw == null) return;
    const target = Number(raw);
    if (!Number.isFinite(target)) return;
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-year]"));
    let best: HTMLElement | undefined;
    let bestDist = Infinity;
    for (const c of cards) {
      const d = Math.abs(Number(c.dataset.year) - target);
      if (d < bestDist) { best = c; bestDist = d; }
    }
    // Deep links jump; the animated "fall into time" entry is a separate feature (week 3).
    best?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [raw]);

  return null;
}

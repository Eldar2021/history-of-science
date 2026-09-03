"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { formatYear, type Locale } from "@/lib/i18n/formatYear";
import { fromContinuous, toContinuous } from "@/lib/timeline/xScale";
import { FALL_FLAG, FALL_FROM, easeOut, parseDuration } from "@/lib/timeline/fall";

type Props = { locale: Locale; firstYear: number };

/**
 * The entry: after the home CTA, the screen dims and the year counts back from
 * FALL_FROM to the first event (or to ?year=), slowing as it lands, then the timeline appears.
 * Runs only when the CTA set the session flag, so a shared timeline link opens plainly.
 * Reduced motion: no counting, just a short fade. Pure DOM work: the overlay is static markup.
 */
export function FallOverlay({ locale, firstYear }: Props) {
  const params = useSearchParams();
  const yearParam = params.get("year");
  const overlay = useRef<HTMLDivElement>(null);
  const number = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let flagged = false;
    try { flagged = sessionStorage.getItem(FALL_FLAG) === "1"; sessionStorage.removeItem(FALL_FLAG); } catch { /* ignore */ }
    const el = overlay.current, num = number.current;
    if (!flagged || !el || !num) return;

    const requested = Number(yearParam);
    const target = Number.isInteger(requested) && requested !== 0 ? requested : firstYear;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = parseDuration(getComputedStyle(document.documentElement).getPropertyValue("--duration-fall"), 1500);
    const from = toContinuous(FALL_FROM), to = toContinuous(target);

    el.hidden = false;
    document.body.style.overflow = "hidden";
    let frame = 0;
    const start = performance.now();
    const finish = () => {
      num.textContent = formatYear(target, "exact", locale);
      el.style.opacity = "0";
      window.setTimeout(() => { el.hidden = true; document.body.style.overflow = ""; }, 400);
    };
    if (reduce) {
      num.textContent = formatYear(target, "exact", locale);
      window.setTimeout(finish, duration);
    } else {
      const tick = (now: number) => {
        const t = (now - start) / duration;
        num.textContent = formatYear(fromContinuous(from + (to - from) * easeOut(t)), "exact", locale);
        if (t < 1) frame = requestAnimationFrame(tick); else finish();
      };
      frame = requestAnimationFrame(tick);
    }
    return () => { cancelAnimationFrame(frame); document.body.style.overflow = ""; };
    // Runs once per mount; the flag is consumed on the first pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={overlay}
      hidden
      aria-hidden
      className="fixed inset-0 z-30 flex items-center justify-center bg-base transition-opacity duration-(--duration-event-fade)"
    >
      <span ref={number} className="font-display text-year-hero tabular text-primary" />
    </div>
  );
}

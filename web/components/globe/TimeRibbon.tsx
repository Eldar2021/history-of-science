"use client";

import { useRef } from "react";
import { nearestByUnit, type RibbonEra, type StripEvent } from "@/lib/globe/strip";

/** An era narrower than this fraction of the axis has no room for its name. */
const NAMEABLE = 0.1;

type Props = {
  events: StripEvent[];
  eras: RibbonEra[];
  index: number;
  onSelect: (index: number) => void;
};

/**
 * The real time axis, above the strip of cards.
 *
 * Fifty cards of equal width flatten 2600 years into fifty equal steps, which is the opposite of
 * what this site is about ("how slowly it started, and how fast it got"). The ribbon is where the
 * shape of history stays true: antiquity long and nearly empty, the last two centuries crowded.
 * Positions come from lib/timeline/xScale, the one time scale (ADR-006).
 *
 * Hidden from assistive technology on purpose: it is a pointer shortcut to something already
 * reachable - every event is a link in the strip below, and the era name is on the card.
 */
export function TimeRibbon({ events, eras, index, onSelect }: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  const pick = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    if (rect.width === 0) return;
    const found = nearestByUnit(events, (clientX - rect.left) / rect.width);
    if (found >= 0) onSelect(found);
  };

  return (
    <div
      ref={barRef}
      aria-hidden
      onPointerDown={(event) => pick(event.clientX)}
      className="relative mx-4 h-7 cursor-pointer touch-none select-none"
    >
      {eras.map((era) => (
        <span
          key={era.slug}
          className="absolute bottom-0 top-0 overflow-hidden whitespace-nowrap border-l border-line pl-1.5 pt-0.5 text-[10px] uppercase tracking-wider text-muted/45"
          style={{ left: `${era.startUnit * 100}%`, width: `${(era.endUnit - era.startUnit) * 100}%` }}
        >
          {/* The recent eras are a few decades each and their names do not fit; a clipped word is
              worse than none, and the card already names the era the reader is standing in. */}
          {era.endUnit - era.startUnit > NAMEABLE && <span className="hidden sm:inline">{era.name}</span>}
        </span>
      ))}

      <span className="absolute inset-x-0 bottom-0 h-px bg-line" />

      {events.map((event, i) => (
        <span
          key={event.slug}
          className={
            i === index
              ? "absolute bottom-0 h-3.5 w-0.5 -translate-x-1/2 bg-[var(--globe-marker)]"
              : "absolute bottom-0 h-1.5 w-px -translate-x-1/2 bg-muted/40"
          }
          style={{ left: `${event.unit * 100}%` }}
        />
      ))}
    </div>
  );
}

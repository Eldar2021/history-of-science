"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatYearParts, type Locale } from "@/lib/i18n/formatYear";
import type { StripEvent } from "@/lib/globe/strip";

type Props = {
  events: StripEvent[];
  index: number;
  locale: Locale;
  onSelect: (index: number) => void;
  /** True once the reader has turned the globe away from the active place. */
  offCentre: boolean;
  onRecenter: () => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

/** How long the strip waits after the last scroll event before deciding which card the reader chose. */
const SETTLE_MS = 140;
/** How long a scroll the strip started itself may still be arriving. */
const SCROLL_MS = 700;
/** Card width, small and open. Open is wider than half a narrow phone, so a sentence has room. */
const CARD_WIDTH = { small: "10rem", open: "min(74vw, 17rem)" };

/**
 * Every event, in order, along the foot of the home page: the timeline itself, not a way to another
 * page (ADR-030).
 *
 * Each card is a real link to its event, rendered on the server, so the page carries all fifty
 * titles for a crawler and works without JavaScript. With JavaScript, a click on a card that is not
 * the active one selects it instead of navigating; a second click on the card you are already
 * looking at opens the story - or, if you have turned the globe by hand, brings it back to the place.
 *
 * Selection follows scroll-snap rather than the scroll itself: the globe is drawn a pixel at a time,
 * and asking it for a new camera on every scroll frame would make a phone stutter. One card, one turn.
 */
export function EventStrip({ events, index, locale, onSelect, offCentre, onRecenter, expanded, onExpandedChange }: Props) {
  const t = useTranslations("home");
  const listRef = useRef<HTMLOListElement>(null);
  const itemsRef = useRef<Array<HTMLLIElement | null>>([]);
  /** Until this moment, movement is the strip centring a card, not the reader choosing one. */
  const settlesAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  // Bring the active card to the middle whenever it changes - including when the change came from
  // the globe, the keyboard or a shared link, which is most of the point of having it.
  useEffect(() => {
    const item = itemsRef.current[index];
    if (!item) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    settlesAt.current = performance.now() + (reduced ? SETTLE_MS : SCROLL_MS);
    item.scrollIntoView({ inline: "center", block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [index, expanded]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onScroll = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (performance.now() < settlesAt.current) return;
      const list = listRef.current;
      if (!list) return;
      const middle = list.scrollLeft + list.clientWidth / 2;
      let best = index;
      let bestDistance = Infinity;
      itemsRef.current.forEach((item, i) => {
        if (!item) return;
        const centre = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(centre - middle);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      if (best !== index) onSelect(best);
    }, SETTLE_MS);
  };

  const onCardClick = (event: React.MouseEvent, i: number) => {
    // A middle click or a modifier means "open this somewhere else"; that is the browser's business.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (i !== index) {
      event.preventDefault();
      onSelect(i);
      return;
    }
    if (offCentre) {
      event.preventDefault();
      onRecenter();
    }
    // Otherwise the link does what it says and opens the story.
  };

  const step = (delta: number) => onSelect(Math.min(events.length - 1, Math.max(0, index + delta)));

  return (
    <div
      className="relative"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") onExpandedChange(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") onExpandedChange(false); }}
    >
      {/* The grip: a mouse gets the cards by hovering, a finger has to be able to ask. */}
      <button
        type="button"
        onClick={() => onExpandedChange(!expanded)}
        aria-expanded={expanded}
        className="mx-auto flex h-6 w-20 items-center justify-center sm:hidden"
      >
        <span aria-hidden className="h-1 w-10 rounded-full bg-muted/40" />
        <span className="sr-only">{t(expanded ? "collapse" : "expand")}</span>
      </button>

      <ol
        ref={listRef}
        onScroll={onScroll}
        aria-label={t("strip")}
        className="relative flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        // The padding is what lets the first and last card reach the middle, so it is derived from
        // the card width rather than guessed alongside it.
        style={{
          "--card-w": expanded ? CARD_WIDTH.open : CARD_WIDTH.small,
          paddingInline: "calc(50% - var(--card-w) / 2)",
        } as React.CSSProperties}
      >
        {events.map((event, i) => {
          const active = i === index;
          const year = formatYearParts(event.year, event.precision, locale);
          return (
            <li
              key={event.slug}
              ref={(el) => { itemsRef.current[i] = el; }}
              className="shrink-0 snap-center"
            >
              <Link
                href={`/event/${event.slug}`}
                aria-current={active ? "true" : undefined}
                onClick={(clicked) => onCardClick(clicked, i)}
                onFocus={() => onSelect(i)}
                className={`flex w-[var(--card-w)] flex-col overflow-hidden rounded-lg border px-3 py-2 backdrop-blur-md transition-colors ${
                  expanded ? "h-[9.5rem]" : "h-[5.25rem]"
                } ${
                  active
                    ? "border-accent/60 bg-elevated text-primary"
                    : "border-line bg-elevated/45 text-secondary opacity-60 hover:border-accent/40 hover:opacity-100"
                }`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  {/* "around" rides beside the number in small type rather than being dropped:
                      a card the reader scans is exactly where an invented certainty would do harm. */}
                  <span className="truncate font-display text-sm tabular">
                    {year.qualifier && <span className="font-sans text-[10px] text-muted">{year.qualifier} </span>}
                    {year.value}
                  </span>
                  {/* The globe has been turned away by hand; the card you are on is how you get back. */}
                  {active && offCentre && (
                    <span title={t("recenter")} className="text-xs text-[var(--globe-marker)]">
                      <span aria-hidden>◎</span>
                      <span className="sr-only">{t("recenter")}</span>
                    </span>
                  )}
                </span>
                <span className={`mt-0.5 line-clamp-2 font-display leading-snug ${expanded ? "text-sm" : "text-xs"}`}>
                  {event.title}
                </span>
                {/* Kept in the document when the cards are small: it costs nothing and a crawler,
                    or somebody listening rather than looking, still gets the whole sentence. */}
                <span className={expanded ? "mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted" : "sr-only"}>
                  {event.summary}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* A horizontal list is awkward with a mouse wheel, so a mouse gets the two buttons it expects.
          A finger swipes, and every keyboard already has the arrow keys. */}
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={index === 0}
        aria-label={t("previous")}
        className="absolute left-2 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-elevated text-secondary backdrop-blur-md transition hover:border-accent hover:text-primary disabled:opacity-30 disabled:hover:border-line sm:flex"
      >
        &larr;
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={index === events.length - 1}
        aria-label={t("next")}
        className="absolute right-2 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-elevated text-secondary backdrop-blur-md transition hover:border-accent hover:text-primary disabled:opacity-30 disabled:hover:border-line sm:flex"
      >
        &rarr;
      </button>
    </div>
  );
}

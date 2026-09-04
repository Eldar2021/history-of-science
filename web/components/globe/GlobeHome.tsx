"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { formatYearParts, type Locale } from "@/lib/i18n/formatYear";
import { formatPlaceParts } from "@/lib/i18n/formatPlace";
import type { GlobeEvent } from "@/lib/globe/events";
import type { RibbonEra, StripEvent } from "@/lib/globe/strip";
import { EventStrip } from "./EventStrip";
import { Globe } from "./Globe";
import { TimeRibbon } from "./TimeRibbon";

type Props = {
  /** Every event, in order: this page is the timeline now (ADR-030). */
  events: StripEvent[];
  /** The subset the globe can point at, in the same order. */
  places: GlobeEvent[];
  eras: RibbonEra[];
  locale: Locale;
};

/**
 * The home page: a globe that turns to wherever the current event happened, and, along the foot,
 * the whole timeline as a strip of cards.
 *
 * The first event is rendered on the server, so the page has real text before any script runs, and
 * the strip is a list of real links, so a reader without JavaScript still has every event. A shared
 * ?event=... link is picked up after mount rather than on the server, which keeps this page
 * statically rendered; the globe turns to it, which reads as intent rather than as a correction.
 */
export function GlobeHome({ events, places, eras, locale }: Props) {
  const t = useTranslations("home");
  const [index, setIndex] = useState(0);
  /** True once the reader has turned the globe away from the active place by hand. */
  const [offCentre, setOffCentre] = useState(false);
  /** Bumped to ask the globe to turn back, when the active event has not itself changed. */
  const [recenterKey, setRecenterKey] = useState(0);
  /** Whether the strip is showing its cards big enough to read. */
  const [expanded, setExpanded] = useState(false);
  /** The URL only starts carrying ?event= once the reader has actually moved. */
  const moved = useRef(false);

  const select = useCallback((next: number) => {
    setIndex((current) => {
      if (next === current) return current;
      moved.current = true;
      return next;
    });
  }, []);

  const step = useCallback((delta: number) => {
    setIndex((current) => {
      const next = Math.min(events.length - 1, Math.max(0, current + delta));
      if (next !== current) moved.current = true;
      return next;
    });
  }, [events.length]);

  /** A pin on the globe belongs to an event; the globe knows its own index, not the strip's. */
  const stripIndexOfPlace = useMemo(() => {
    const map: number[] = [];
    events.forEach((event, i) => { if (event.globeIndex !== null) map[event.globeIndex] = i; });
    return map;
  }, [events]);

  /**
   * How far along the road we are. An event with no single place leaves the globe where it was
   * (ADR-025), and the road it has travelled should stay drawn behind it rather than disappear.
   */
  const trailTo = useMemo(() => {
    for (let i = index; i >= 0; i--) {
      const at = events[i].globeIndex;
      if (at !== null) return at;
    }
    return 0;
  }, [events, index]);

  useEffect(() => {
    // Syncing state from an external system - the URL - which is exactly what an effect is for.
    // It cannot be read during render: the page is prerendered at build time and the query string
    // only exists in the browser, so reading it while rendering would break hydration.
    const slug = new URLSearchParams(window.location.search).get("event");
    if (!slug) return;
    const found = events.findIndex((e) => e.slug === slug);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (found >= 0) setIndex(found);
  }, [events]);

  useEffect(() => {
    if (!moved.current) return;
    // replaceState, not pushState: the back button should leave the home page, not walk back
    // through fifty events one at a time. Opening an event still pushes a real entry.
    const url = new URL(window.location.href);
    url.searchParams.set("event", events[index].slug);
    window.history.replaceState(null, "", url);
  }, [index, events]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      // Not while the event sheet or the honesty dialog is open, and not while someone is typing.
      if (document.querySelector("[role=dialog]") || document.querySelector("dialog[open]")) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))) return;
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const current = events[index];
  const year = formatYearParts(current.year, current.precision, locale);
  const place = formatPlaceParts(current.placeName, current.placePrecision, locale);
  /** The tail may only claim to point at the pin while there is one and it is in the middle. */
  const pointing = current.globeIndex !== null && !offCentre;

  return (
    <main className="globe-stage relative h-[100dvh] w-full overflow-hidden bg-[var(--globe-space)]">
      <Globe
        places={places}
        activeIndex={current.globeIndex ?? -1}
        trailTo={trailTo}
        recenterKey={recenterKey}
        onSelect={(at) => select(stripIndexOfPlace[at] ?? index)}
        onOffCentreChange={setOffCentre}
      />

      {/* The site's own bar, with no background of its own, floating on the sky (ADR-027). */}
      <SiteHeader over />

      {/* Below the bar. The heading stays in the document for readers and search engines even on
          a phone, where there is no room to show it. The wrapper does the positioning: sr-only
          makes the heading itself absolute, and not-sr-only would undo any placement put on it. */}
      <div className="pointer-events-none absolute left-6 top-[4.25rem] z-10 max-w-[15rem]">
        <h1 className="sr-only font-display text-lg leading-snug text-secondary sm:not-sr-only">
          {t("question")}
        </h1>
      </div>

      {/* Where we are in the walk, for somebody listening rather than looking; the strip says it
          by sight, and by aria-current to anything reading the list. */}
      <p aria-live="polite" className="sr-only">{t("progress", { index: index + 1, total: events.length })}</p>

      <Link
        href={`/event/${current.slug}`}
        aria-label={t("openEvent", { title: current.title })}
        className={`absolute bottom-[10.5rem] left-1/2 z-10 block w-[min(86vw,23rem)] -translate-x-1/2 rounded-lg border border-line bg-elevated/65 p-4 shadow-lg backdrop-blur-md transition hover:border-accent sm:w-[min(92vw,26rem)] sm:p-6 sm:bottom-auto sm:left-[calc(50%+8.5rem)] sm:top-1/2 sm:-translate-x-0 sm:-translate-y-1/2 ${
          // On a phone the open strip is the reading surface, and this card would be under it.
          expanded ? "max-sm:invisible" : ""
        }`}
      >
        {/* The tail points at the pin, which sits in the centre of the sphere: below the card on
            a phone, to its left on a wider screen (lib/globe/layout.ts). Once the reader turns
            the globe by hand the pin is elsewhere, so the tail goes rather than lie. */}
        {pointing && (
          <>
            <span aria-hidden className="absolute -top-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-l border-t border-line bg-elevated/65 backdrop-blur-md sm:hidden" />
            <span aria-hidden className="absolute -left-[7px] top-1/2 hidden size-3 -translate-y-1/2 rotate-45 border-b border-l border-line bg-elevated/65 backdrop-blur-md sm:block" />
          </>
        )}

        {year.qualifier && <p className="text-xs text-muted">{year.qualifier}</p>}
        <p className="font-display text-2xl tabular text-primary sm:text-3xl" title={year.eraNote ?? undefined}>{year.value}</p>
        <h2 className="mt-1.5 font-display text-lg leading-snug text-primary sm:mt-2 sm:text-xl">{current.title}</h2>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-secondary sm:mt-2 sm:line-clamp-none">{current.summary}</p>
        <p className="mt-2.5 flex flex-wrap gap-x-2 text-xs text-muted sm:mt-3">
          {place.value && (
            <span>
              {place.value}
              {place.note && <span className="text-muted/80"> · {place.note}</span>}
            </span>
          )}
          {current.era && <span className="text-muted/70">{current.era}</span>}
        </p>
      </Link>

      {/* The timeline itself: the axis, then every event as a card. */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <TimeRibbon events={events} eras={eras} index={index} onSelect={select} />
        <EventStrip
          events={events}
          index={index}
          locale={locale}
          onSelect={select}
          offCentre={offCentre}
          onRecenter={() => setRecenterKey((n) => n + 1)}
          expanded={expanded}
          onExpandedChange={setExpanded}
        />
      </div>
    </main>
  );
}

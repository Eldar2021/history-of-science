"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatYearParts, type Locale } from "@/lib/i18n/formatYear";
import { formatPlaceParts } from "@/lib/i18n/formatPlace";
import type { GlobeEvent } from "@/lib/globe/events";
import { Globe } from "./Globe";

type Props = { events: GlobeEvent[]; locale: Locale };

/**
 * The home page: a globe that turns to wherever the current event happened, and two buttons that
 * walk the whole timeline in order.
 *
 * The first event is rendered on the server, so the page has real text before any script runs and
 * a reader without JavaScript still gets the story and the link into the timeline. A shared
 * ?event=... link is picked up after mount rather than on the server, which keeps this page
 * statically rendered; the globe turns to it, which reads as intent rather than as a correction.
 */
export function GlobeHome({ events, locale }: Props) {
  const t = useTranslations("home");
  const [index, setIndex] = useState(0);
  /** True once the reader has turned the globe away from the active place by hand. */
  const [offCentre, setOffCentre] = useState(false);
  /** Bumped to ask the globe to turn back, when the active event has not itself changed. */
  const [recenterKey, setRecenterKey] = useState(0);
  /** The URL only starts carrying ?event= once the reader has actually moved. */
  const moved = useRef(false);

  const go = useCallback((delta: number) => {
    setIndex((current) => {
      const next = Math.min(events.length - 1, Math.max(0, current + delta));
      if (next !== current) moved.current = true;
      return next;
    });
  }, [events.length]);

  const jumpTo = useCallback((next: number) => {
    moved.current = true;
    setIndex(next);
  }, []);

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
    // through forty-odd events one at a time. Opening an event still pushes a real entry.
    const url = new URL(window.location.href);
    url.searchParams.set("event", events[index].slug);
    window.history.replaceState(null, "", url);
  }, [index, events]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      // Not while the event sheet is open, and not while someone is typing.
      if (document.querySelector("[role=dialog]")) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))) return;
      event.preventDefault();
      go(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const current = events[index];
  const year = formatYearParts(current.year, current.precision, locale);
  const place = formatPlaceParts(current.placeName, current.placePrecision, locale);

  return (
    <main className="globe-stage relative flex-1 overflow-hidden bg-[var(--globe-space)]">
      <Globe
        places={events}
        activeIndex={index}
        recenterKey={recenterKey}
        onSelect={jumpTo}
        onOffCentreChange={setOffCentre}
      />

      {/* One bar, so the two cannot overlap on a narrow screen. The heading stays in the
          document for readers and search engines even where there is no room to show it. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start gap-4 p-6">
        <h1 className="sr-only max-w-[14rem] font-display text-lg leading-snug text-secondary sm:not-sr-only">
          {t("question")}
        </h1>
        <Link
          href="/timeline"
          className="pointer-events-auto ml-auto rounded-full border border-line px-4 py-2 text-sm text-secondary transition hover:border-accent hover:text-primary"
        >
          {t("exploreAll")}
        </Link>
      </div>

      <Link
        href={`/event/${current.slug}`}
        aria-label={t("openEvent", { title: current.title })}
        className="absolute bottom-28 left-1/2 z-10 block w-[min(92vw,26rem)] -translate-x-1/2 rounded-lg border border-line bg-elevated p-6 shadow-lg transition hover:border-accent sm:bottom-auto sm:left-[calc(50%+8.5rem)] sm:top-1/2 sm:-translate-x-0 sm:-translate-y-1/2"
      >
        {/* The tail points at the pin, which sits in the centre of the sphere: below the card on
            a phone, to its left on a wider screen (lib/globe/layout.ts). Once the reader turns
            the globe by hand the pin is elsewhere, so the tail goes rather than lie. */}
        {!offCentre && (
          <>
            <span aria-hidden className="absolute -top-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-l border-t border-line bg-elevated sm:hidden" />
            <span aria-hidden className="absolute -left-[7px] top-1/2 hidden size-3 -translate-y-1/2 rotate-45 border-b border-l border-line bg-elevated sm:block" />
          </>
        )}

        {year.qualifier && <p className="text-xs text-muted">{year.qualifier}</p>}
        <p className="font-display text-3xl tabular text-primary" title={year.eraNote ?? undefined}>{year.value}</p>
        <h2 className="mt-2 font-display text-xl leading-snug text-primary">{current.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{current.summary}</p>
        {place.value && (
          <p className="mt-3 text-xs text-muted">
            {place.value}
            {place.note && <span className="text-muted/80"> · {place.note}</span>}
          </p>
        )}
      </Link>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label={t("previous")}
            className="rounded-full border border-line px-4 py-2 text-secondary transition hover:border-accent hover:text-primary disabled:opacity-35 disabled:hover:border-line"
          >
            &larr;
          </button>
          {/* Fixed width: the counter changes on every step and the buttons must not move with it. */}
          <p aria-live="polite" className="w-24 text-center text-sm tabular text-muted">
            {t("progress", { index: index + 1, total: events.length })}
          </p>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === events.length - 1}
            aria-label={t("next")}
            className="rounded-full border border-line px-4 py-2 text-secondary transition hover:border-accent hover:text-primary disabled:opacity-35 disabled:hover:border-line"
          >
            &rarr;
          </button>
        </div>
        {/* Its own line, so an era name of any length leaves the buttons where they were. */}
        {current.era && <p className="text-xs text-muted">{current.era}</p>}
      </div>

      {offCentre && (
        <button
          type="button"
          onClick={() => setRecenterKey((n) => n + 1)}
          className="absolute bottom-6 right-6 z-10 rounded-full border border-accent/60 px-4 py-2 text-sm text-secondary transition hover:text-primary"
        >
          {t("recenter")}
        </button>
      )}
    </main>
  );
}

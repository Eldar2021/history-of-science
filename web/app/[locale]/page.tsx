import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";
import { HonestyBand } from "@/components/HonestyBand";
import { GlobeHome } from "@/components/globe/GlobeHome";
import { toGlobeEvents } from "@/lib/globe/events";
import { toRibbonEras, toStripEvents } from "@/lib/globe/strip";
import type { Locale } from "@/lib/i18n/formatYear";
import { getEras, getTimeline } from "@/lib/queries/timeline";

/**
 * The home page is the globe, and the timeline runs along the foot of it (ADR-024). The
 * first event and every card are rendered here on the server, so the page carries real text and a
 * link to every event before any script runs.
 *
 * Events with no place are on the strip like any other; the globe simply has nothing to point at
 * for them (ADR-025). Only a database with no published events at all falls back to a plain page.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, timeline, eras] = await Promise.all([getTranslations("home"), getTimeline(locale), getEras(locale)]);
  const eraNames = new Map(eras.map((e) => [e.id, e.name]));

  const places = toGlobeEvents(timeline, eraNames);
  const events = toStripEvents(timeline, eraNames, places);

  if (events.length > 0) {
    return <GlobeHome events={events} places={places} eras={toRibbonEras(eras)} locale={locale} />;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <h1 className="font-display text-4xl leading-tight text-primary sm:text-6xl">{t("question")}</h1>
        <p className="max-w-xl text-lg text-secondary">{t("lead")}</p>
      </main>
      <HonestyBand />
    </>
  );
}

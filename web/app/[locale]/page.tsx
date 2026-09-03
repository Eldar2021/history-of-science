import { getTranslations, setRequestLocale } from "next-intl/server";
import { FallLink } from "@/components/FallLink";
import { SiteHeader } from "@/components/SiteHeader";
import { HonestyBand } from "@/components/HonestyBand";
import { GlobeHome } from "@/components/globe/GlobeHome";
import { toGlobeEvents } from "@/lib/globe/events";
import type { Locale } from "@/lib/i18n/formatYear";
import { getEras, getTimeline } from "@/lib/queries/timeline";

/**
 * The home page is the globe (ADR-024). The first event is rendered here on the server, so the
 * page carries real text and a way into the timeline before any script runs.
 *
 * Events with no place cannot be pointed at, so they are not part of the tour; they are still on
 * the timeline. If no event has a place yet - a database where migration 0004 has not run - the
 * page falls back to the old opening rather than showing an empty world.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, timeline, eras] = await Promise.all([getTranslations("home"), getTimeline(locale), getEras(locale)]);
  const eraNames = new Map(eras.map((e) => [e.id, e.name]));

  const events = toGlobeEvents(timeline, eraNames);

  return (
    <>
      <SiteHeader />
      {events.length > 0 ? (
        <GlobeHome events={events} locale={locale} />
      ) : (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
          <h1 className="font-display text-4xl leading-tight text-primary sm:text-6xl">{t("question")}</h1>
          <p className="max-w-xl text-lg text-secondary">{t("lead")}</p>
          <FallLink className="rounded-full bg-accent px-8 py-3 text-base font-medium text-accent-ink transition hover:bg-accent-hover">
            {t("cta")}
          </FallLink>
        </main>
      )}
      <HonestyBand />
    </>
  );
}

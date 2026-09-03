import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/formatYear";
import { yearsBetween } from "@/lib/i18n/formatYear";
import { getDisciplines, getEras, getTimeline } from "@/lib/queries/timeline";
import type { Era, TimelineEvent } from "@/lib/queries/types";
import { SiteHeader } from "@/components/SiteHeader";
import { HonestyBand } from "@/components/HonestyBand";
import { EventCard } from "@/components/timeline/EventCard";
import { EraHeader } from "@/components/timeline/EraHeader";
import { TimeGap } from "@/components/timeline/TimeGap";
import { YearIndicator } from "@/components/timeline/YearIndicator";

export const revalidate = 300;

/** 05-timeline-ux: a gap marker appears for silences longer than 50 years, never after 1800. */
const GAP_THRESHOLD = 50;
const GAP_CUTOFF_YEAR = 1800;

type Item = { event: TimelineEvent; gapBefore: number | null };
type EraGroup = { era: Era | null; items: Item[] };

/** Events arrive sorted by year and eras are contiguous, so consecutive runs share an era.
 *  gapBefore is the silence (in years) since the previous event when it deserves a marker. */
function groupByEra(events: TimelineEvent[], eras: Era[]): EraGroup[] {
  const eraById = new Map(eras.map((e) => [e.id, e]));
  const groups: EraGroup[] = [];
  events.forEach((event, i) => {
    const prev = events[i - 1];
    const gap = prev ? yearsBetween(prev.year, event.year) : 0;
    const gapBefore = prev && gap > GAP_THRESHOLD && event.year < GAP_CUTOFF_YEAR ? gap : null;
    const last = groups[groups.length - 1];
    if (last && last.era?.id === event.era_id) last.items.push({ event, gapBefore });
    else groups.push({ era: eraById.get(event.era_id) ?? null, items: [{ event, gapBefore }] });
  });
  return groups;
}

export default async function TimelinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, tLocales] = await Promise.all([getTranslations("timeline"), getTranslations("locales")]);
  const [events, eras, disciplines] = await Promise.all([getTimeline(locale), getEras(locale), getDisciplines(locale)]);
  const disciplineNames = new Map(disciplines.map((d) => [d.slug, d.name]));
  const labels = {
    landmark: t("landmark"),
    notTranslated: t("notTranslated", { locale: tLocales(locale) }),
    machineTranslated: t("machineTranslated"),
  };
  const groups = groupByEra(events, eras);

  return (
    <>
      <SiteHeader
        center={events[0] && <YearIndicator locale={locale} initialYear={events[0].year} initialEra={groups[0]?.era?.name} />}
      />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-4">
        <p className="mb-2 text-small text-muted">{t("eventsCount", { count: events.length })}</p>
        {groups.map((group, gi) => {
          const headingId = `era-${group.era?.slug ?? gi}`;
          return (
            <section key={headingId} aria-labelledby={group.era ? headingId : undefined}>
              {group.era && <EraHeader era={group.era} locale={locale} todayLabel={t("today")} headingId={headingId} />}
              <ol className="relative ml-3 space-y-5 pl-8">
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 top-0 w-0.5"
                  style={{ background: "linear-gradient(transparent, var(--accent) 24px, var(--accent) calc(100% - 24px), transparent)" }}
                />
                {group.items.map(({ event, gapBefore }) => (
                  <li key={event.id}>
                    {gapBefore !== null && <TimeGap label={t("yearsPassed", { years: gapBefore })} />}
                    <EventCard event={event} locale={locale} eraName={group.era?.name} disciplineNames={disciplineNames} labels={labels} />
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </main>
      <HonestyBand context="timeline" />
    </>
  );
}

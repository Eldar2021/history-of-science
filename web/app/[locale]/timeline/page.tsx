import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/formatYear";
import { formatYearRange, yearsBetween } from "@/lib/i18n/formatYear";
import { getEras, getTimeline } from "@/lib/queries/timeline";
import { SiteHeader } from "@/components/SiteHeader";
import { HonestyBand } from "@/components/HonestyBand";

export const revalidate = 300;

const GAP_THRESHOLD = 50;
const GAP_CUTOFF_YEAR = 1800;

export default async function TimelinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const t = await getTranslations();
  const [events, eras] = await Promise.all([getTimeline(locale), getEras(locale)]);
  const eraById = new Map(eras.map((e) => [e.id, e]));

  return (
    <>
      <SiteHeader center={t("timeline.title")} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <p className="mb-8 text-sm text-muted">{t("timeline.eventsCount", { count: events.length })}</p>
        <ol className="relative border-l border-line pl-6">
          {events.map((ev, i) => {
            const prev = events[i - 1];
            const newEra = !prev || prev.era_id !== ev.era_id;
            const gap = prev ? yearsBetween(prev.year, ev.year) : 0;
            const showGap = prev && gap > GAP_THRESHOLD && ev.year < GAP_CUTOFF_YEAR;
            return (
              <li key={ev.id} className="mb-10">
                {newEra && (
                  <h2 className="-ml-6 mb-6 border-l-2 border-accent pl-5 font-display text-2xl text-primary">
                    {eraById.get(ev.era_id)?.name ?? ev.era_id}
                  </h2>
                )}
                {showGap && (
                  <p className="-ml-6 mb-6 border-l border-dashed border-line pl-6 text-sm italic text-muted">
                    {t("timeline.yearsPassed", { years: gap })}
                  </p>
                )}
                <article className="relative">
                  <span aria-hidden className="absolute -left-[31px] top-2 h-2.5 w-2.5 rounded-full bg-accent" />
                  <time className="font-display text-3xl tabular text-accent">
                    {formatYearRange(ev.year, ev.year_end, ev.precision, locale)}
                  </time>
                  <h3 className="mt-1 text-xl font-semibold text-primary">{ev.title}</h3>
                  <p className="mt-2 text-secondary">{ev.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {ev.disciplines.map((d) => (
                      <span key={d} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-secondary">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--discipline-${d})` }} />
                        {d}
                      </span>
                    ))}
                    {ev.is_fallback && (
                      <span className="rounded-full bg-elevated px-2 py-0.5 text-muted">
                        {t("timeline.notTranslated", { locale: t(`locales.${locale}`) })}
                      </span>
                    )}
                    {ev.translation_status === "machine" && (
                      <span className="rounded-full bg-elevated px-2 py-0.5 text-muted">{t("timeline.machineTranslated")}</span>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </main>
      <HonestyBand context="timeline" />
    </>
  );
}

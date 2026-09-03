import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/formatYear";
import { getEventDetail } from "@/lib/queries/event";
import { DetailPanel } from "@/components/event/DetailPanel";
import { EventDetail } from "@/components/event/EventDetail";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Intercepts /[locale]/event/[slug] when navigated to from the timeline: side panel / sheet over the list. */
export default async function EventPanel({ params }: Props) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [event, t, tNotFound] = await Promise.all([getEventDetail(slug, locale), getTranslations("event"), getTranslations("notFound")]);

  return (
    <DetailPanel closeLabel={t("close")} labelledBy="event-panel-title">
      {event ? (
        <EventDetail event={event} locale={locale} headingLevel="h2" headingId="event-panel-title" />
      ) : (
        <div>
          <h2 id="event-panel-title" className="font-display text-2xl text-primary">{tNotFound("title")}</h2>
          <p className="mt-2 text-body text-secondary">{tNotFound("text")}</p>
        </div>
      )}
    </DetailPanel>
  );
}

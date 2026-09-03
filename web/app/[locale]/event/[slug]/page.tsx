import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/formatYear";
import { formatYear } from "@/lib/i18n/formatYear";
import { getEventDetail } from "@/lib/queries/event";
import { SiteHeader } from "@/components/SiteHeader";
import { HonestyBand } from "@/components/HonestyBand";
import { EventDetail } from "@/components/event/EventDetail";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEventDetail(slug, locale as Locale);
  if (!event) return {};
  return { title: `${formatYear(event.year, event.precision, locale as Locale)} · ${event.title}`, description: event.summary };
}

/** Direct URL (shared link, search): the same detail as the panel, as a full page. */
export default async function EventPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [event, t] = await Promise.all([getEventDetail(slug, locale), getTranslations("nav")]);
  if (!event) notFound();

  return (
    <>
      <SiteHeader center={<span className="text-secondary">{t("timeline")}</span>} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-8">
        <EventDetail event={event} locale={locale} headingLevel="h1" />
      </main>
      <HonestyBand context={`event ${event.slug} (${event.year})`} />
    </>
  );
}

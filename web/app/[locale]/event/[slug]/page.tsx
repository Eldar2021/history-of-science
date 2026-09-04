import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/formatYear";
import { formatYear } from "@/lib/i18n/formatYear";
import { getEventDetail } from "@/lib/queries/event";
import { routing } from "@/i18n/routing";
import { absolute, alternates } from "@/lib/site";
import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { HonestyBand } from "@/components/HonestyBand";
import { EventDetail } from "@/components/event/EventDetail";

export const revalidate = 300;
// Published events are prerendered (fast LCP, no server round trip); new slugs render on demand
// and are then cached, and updateTag(event:slug) in the admin drops a stale page.
export const dynamicParams = true;

export async function generateStaticParams() {
  if (!hasSupabaseEnv()) return [];
  const { data } = await createAnonClient().from("events").select("slug").eq("status", "published").is("deleted_at", null);
  return (data ?? []).flatMap((e) => routing.locales.map((locale) => ({ locale, slug: e.slug })));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEventDetail(slug, locale as Locale);
  if (!event) return {};
  const title = `${formatYear(event.year, event.precision, locale as Locale)} · ${event.title}`;
  return {
    title,
    description: event.summary,
    alternates: alternates(locale as Locale, `/event/${slug}`),
    openGraph: { type: "article", title, description: event.summary, locale, url: absolute(`/${locale}/event/${slug}`) },
  };
}

/** Direct URL (shared link, search): the same detail as the panel, as a full page. */
export default async function EventPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const event = await getEventDetail(slug, locale);
  if (!event) notFound();

  return (
    <>
      {/* The bar said "Timeline" here, back when that was a page to go to. It is the home page
          now, and the wordmark already leads there (ADR-024). */}
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-8">
        <EventDetail event={event} locale={locale} headingLevel="h1" />
      </main>
      <HonestyBand event={{ slug: event.slug, year: event.year, precision: event.precision, title: event.title }} />
    </>
  );
}

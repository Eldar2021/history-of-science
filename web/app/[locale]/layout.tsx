import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { absolute, alternates, SITE_ORIGIN } from "@/lib/site";
import { fontClassName } from "@/lib/fonts";
import "../globals.css";

type Props = { children: React.ReactNode; panel: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    // metadataBase makes every relative URL below - the OG image among them - absolute.
    metadataBase: new URL(SITE_ORIGIN),
    title: { default: t("name"), template: `%s · ${t("name")}` },
    description: t("tagline"),
    alternates: alternates(locale as Locale),
    openGraph: { type: "website", siteName: t("name"), title: t("name"), description: t("tagline"), locale, url: absolute(`/${locale}`) },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({ children, panel, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  const skipToContent = t("skipToContent");

  return (
    <html lang={locale} className={`${fontClassName} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-base text-primary">
        <NextIntlClientProvider>
          {/* Off screen until it is tabbed to: the first stop for a keyboard, ahead of the whole bar. */}
          <a href="#main" className="skip-link">{skipToContent}</a>
          {/* panel: an event opened from the home globe renders over it (intercepting route). */}
          {children}
          {panel}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

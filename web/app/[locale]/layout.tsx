import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { fontClassName } from "@/lib/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "../globals.css";

type Props = { children: React.ReactNode; panel: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return { title: { default: t("name"), template: `%s · ${t("name")}` }, description: t("tagline") };
}

export default async function LocaleLayout({ children, panel, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    // suppressHydrationWarning: the theme script may add data-theme to <html> before React hydrates.
    <html lang={locale} className={`${fontClassName} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-base text-primary">
        {/* panel: an event opened from the home globe renders over it (intercepting route). */}
        <NextIntlClientProvider>{children}{panel}</NextIntlClientProvider>
      </body>
    </html>
  );
}

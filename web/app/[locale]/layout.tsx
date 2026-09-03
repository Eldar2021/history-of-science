import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { fontClassName } from "@/lib/fonts";
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
    <html lang={locale} className={`${fontClassName} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-base text-primary">
        {/* panel: an event opened from the home globe renders over it (intercepting route). */}
        <NextIntlClientProvider>{children}{panel}</NextIntlClientProvider>
      </body>
    </html>
  );
}

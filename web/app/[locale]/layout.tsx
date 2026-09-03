import type { Metadata } from "next";
import { Golos_Text, Literata } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Design concept faces (resource/design/tokens.json): Golos Text for body/UI, Literata for years,
// era names and titles. Both ship cyrillic-ext, which holds the Kyrgyz letters Ң Ө Ү (U+04A2, U+04E8, U+04AE).
const golos = Golos_Text({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});
const literata = Literata({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  axes: ["opsz"],
  display: "swap",
});

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return { title: { default: t("name"), template: `%s · ${t("name")}` }, description: t("tagline") };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${golos.variable} ${literata.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-base text-primary">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { fontClassName } from "@/lib/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: { default: t("title"), template: `%s · ${t("title")}` }, robots: { index: false, follow: false } };
}

/** Root layout of the admin area: no locale prefix; UI language comes from the profile (see i18n/request.ts). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${fontClassName} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-base text-primary">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

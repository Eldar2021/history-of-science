import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { HonestyBand } from "@/components/HonestyBand";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <h1 className="font-display text-4xl leading-tight text-primary sm:text-6xl">{t("question")}</h1>
        <p className="max-w-xl text-lg text-secondary">{t("lead")}</p>
        <Link
          href="/timeline"
          className="rounded-full bg-accent px-8 py-3 text-base font-medium text-base transition hover:opacity-90"
        >
          {t("cta")}
        </Link>
      </main>
      <HonestyBand />
    </>
  );
}

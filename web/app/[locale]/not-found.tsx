import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { HonestyBand } from "@/components/HonestyBand";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-4 py-24">
        <h1 className="font-display text-3xl text-primary">{t("title")}</h1>
        <p className="text-body text-secondary">{t("text")}</p>
        <Link href="/" className="text-accent-text underline underline-offset-4">{t("back")}</Link>
      </main>
      <HonestyBand />
    </>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function SiteHeader({ center }: { center?: React.ReactNode }) {
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-base/90 px-4 py-3 backdrop-blur">
      <Link href="/" className="font-display text-lg text-primary">{t("site.name")}</Link>
      <div className="font-display text-2xl tabular text-accent">{center}</div>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/timeline" className="text-secondary hover:text-primary">{t("nav.timeline")}</Link>
        <LocaleSwitcher />
      </nav>
    </header>
  );
}

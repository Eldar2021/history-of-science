import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ center }: { center?: React.ReactNode }) {
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-10 flex h-[3.5rem] items-center justify-between gap-4 border-b border-line bg-base/90 px-4 backdrop-blur">
      <Link href="/" className="font-display text-lg text-primary">{t("site.name")}</Link>
      <div className="min-w-0 whitespace-nowrap font-display text-2xl tabular text-primary">{center}</div>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/timeline" className="hidden text-secondary hover:text-primary sm:inline">{t("nav.timeline")}</Link>
        <LocaleSwitcher />
        <ThemeToggle />
      </nav>
    </header>
  );
}

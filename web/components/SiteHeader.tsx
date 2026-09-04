import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

/**
 * `over` drops the bar's own background and border so it can float on top of something - the home
 * page globe. Put it inside .globe-stage and the tokens turn light-on-dark by themselves.
 *
 * `trailing` is for whatever a page needs beside the language switcher; the home page puts the
 * honesty badge there (ADR-030).
 */
export function SiteHeader({ center, trailing, over = false }: {
  center?: React.ReactNode;
  trailing?: React.ReactNode;
  over?: boolean;
}) {
  const t = useTranslations();
  return (
    <header
      className={
        over
          ? "absolute inset-x-0 top-0 z-20 flex h-[3.5rem] items-center justify-between gap-4 px-4"
          : "sticky top-0 z-10 flex h-[3.5rem] items-center justify-between gap-4 border-b border-line bg-base/90 px-4 backdrop-blur"
      }
    >
      <Link href="/" className="font-display text-lg text-primary">{t("site.name")}</Link>
      <div className="min-w-0 whitespace-nowrap font-display text-2xl tabular text-primary">{center}</div>
      <nav className="flex items-center gap-3 text-sm">
        {/* The home globe carries no chrome it does not need; every other page keeps the link. */}
        {!over && (
          <Link href="/timeline" className="hidden text-secondary hover:text-primary sm:inline">{t("nav.timeline")}</Link>
        )}
        {trailing}
        <LocaleSwitcher />
      </nav>
    </header>
  );
}

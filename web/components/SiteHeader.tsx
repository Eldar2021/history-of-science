import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteNav } from "./SiteNav";

/**
 * `over` drops the bar's own background and border so it can float on top of something - the home
 * page globe. Put it inside .globe-stage and the tokens turn light-on-dark by themselves. It also
 * asks the nav for the honesty badge, which belongs on the page that has no band (ADR-030).
 */
export function SiteHeader({ center, over = false }: { center?: React.ReactNode; over?: boolean }) {
  const t = useTranslations();
  return (
    <header
      className={
        over
          ? "absolute inset-x-0 top-0 z-20 flex h-[3.5rem] items-center justify-between gap-3 px-4"
          : "sticky top-0 z-10 flex h-[3.5rem] items-center justify-between gap-3 border-b border-line bg-base/90 px-4 backdrop-blur"
      }
    >
      <Link href="/" className="font-display text-lg text-primary">{t("site.name")}</Link>
      <div className="min-w-0 whitespace-nowrap font-display text-2xl tabular text-primary">{center}</div>
      <nav className="flex items-center text-sm">
        <SiteNav honesty={over} />
      </nav>
    </header>
  );
}

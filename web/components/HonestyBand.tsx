import { useLocale, useTranslations } from "next-intl";
import { formatYear, type Locale, type YearPrecision } from "@/lib/i18n/formatYear";

type EventRef = { slug: string; year: number; precision: YearPrecision; title: string };

/** Fallback while no domain is chosen (S14); production sets NEXT_PUBLIC_REPORT_EMAIL. */
const REPORT_EMAIL = process.env.NEXT_PUBLIC_REPORT_EMAIL ?? "eldiiaralmazbekov@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/**
 * The honesty band (ADR-017): on every page, warm and human, with a report link. When an event is on
 * screen, the mail already names it (title, year, URL) so the reader only has to say what is wrong.
 */
export function HonestyBand({ event, path, className = "", compact = false }: {
  event?: EventRef;
  path?: string;
  className?: string;
  /** One quiet line instead of a band: for the home globe, where a paragraph would break the view. */
  compact?: boolean;
}) {
  const t = useTranslations("honesty");
  const locale = useLocale() as Locale;
  const url = `${SITE_URL}/${locale}${event ? `/event/${event.slug}` : path ?? ""}`;
  const subject = event
    ? t("subjectEvent", { title: event.title, year: formatYear(event.year, event.precision, locale) })
    : t("subject");
  const body = t("body", { url });
  const href = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const report = (
    <a className="whitespace-nowrap underline decoration-accent underline-offset-4 hover:text-primary" href={href}>
      {t("report")}
    </a>
  );

  // The admission still has to be on the page; only its size changes.
  if (compact) {
    return (
      <p className={`text-xs text-muted ${className}`}>
        {t("short")} {report}
      </p>
    );
  }

  return (
    <footer className={`mt-auto border-t border-line px-4 py-6 text-sm text-secondary ${className}`}>
      <p className="mx-auto max-w-3xl">
        {t("text")} {report}
      </p>
    </footer>
  );
}

import { useLocale, useTranslations } from "next-intl";
import { formatYear, type Locale, type YearPrecision } from "@/lib/i18n/formatYear";
import { reportHref, SITE_URL } from "@/lib/report";

type EventRef = { slug: string; year: number; precision: YearPrecision; title: string };

/**
 * The honesty band (ADR-017): warm, human, with a report link. When an event is on screen, the mail
 * already names it (title, year, URL) so the reader only has to say what is wrong.
 *
 * Every page carries this except the home page, which is one screen of sky and gets the same
 * admission as a badge that opens instead (HonestyBadge, ADR-030).
 */
export function HonestyBand({ event, path, className = "" }: {
  event?: EventRef;
  path?: string;
  className?: string;
}) {
  const t = useTranslations("honesty");
  const locale = useLocale() as Locale;
  const url = `${SITE_URL}/${locale}${event ? `/event/${event.slug}` : path ?? ""}`;
  const subject = event
    ? t("subjectEvent", { title: event.title, year: formatYear(event.year, event.precision, locale) })
    : t("subject");

  return (
    <footer className={`mt-auto border-t border-line px-4 py-6 text-sm text-secondary ${className}`}>
      <p className="mx-auto max-w-3xl">
        {t("text")}{" "}
        <a
          className="whitespace-nowrap underline decoration-accent underline-offset-4 hover:text-primary"
          href={reportHref(subject, t("body", { url }))}
        >
          {t("report")}
        </a>
      </p>
    </footer>
  );
}

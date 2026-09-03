import { useTranslations } from "next-intl";

/** The honesty band (ADR-017): on every page, warm and human, with a report link. */
export function HonestyBand({ context }: { context?: string }) {
  const t = useTranslations("honesty");
  const subject = encodeURIComponent(`Uchkun: ${context ?? "error report"}`);
  return (
    <footer className="mt-auto border-t border-line px-4 py-6 text-sm text-secondary">
      <p className="mx-auto max-w-3xl">
        {t("text")}{" "}
        <a className="underline decoration-accent underline-offset-4 hover:text-primary" href={`mailto:hello@uchkun.science?subject=${subject}`}>
          {t("report")}
        </a>
      </p>
    </footer>
  );
}

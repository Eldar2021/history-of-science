"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { HonestyBand } from "@/components/HonestyBand";

/**
 * Anything that throws below the locale layout lands here, in the reader's language, with a way out.
 * Without it a production error is Next's bare "Application error", which says nothing in four
 * languages at once.
 */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");

  useEffect(() => {
    // The server log carries the stack; the digest is the only thread between the two.
    console.error("page error", error.digest ?? "", error.message);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-4 py-24">
        <h1 className="font-display text-3xl text-primary">{t("title")}</h1>
        <p className="text-body text-secondary">{t("text")}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <button type="button" onClick={reset} className="rounded-pill bg-accent px-5 py-2 font-medium text-accent-ink transition hover:bg-accent-hover">
            {t("retry")}
          </button>
          <Link href="/" className="text-accent-text underline underline-offset-4">{t("back")}</Link>
        </div>
        {error.digest && <p className="mt-4 font-mono text-label text-muted">{t("reference", { digest: error.digest })}</p>}
      </main>
      <HonestyBand />
    </>
  );
}

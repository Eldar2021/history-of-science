"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { EARTH_SOURCE_URL, reportHref, SITE_URL } from "@/lib/report";

/**
 * The honesty band, on the home page only, as a badge that opens (ADR-030).
 *
 * The admission is a product principle and it stays on every other page as a paragraph. Here the
 * page is one screen of sky with a photograph of the Earth in it, and a paragraph across the foot
 * of it was the last box competing with the globe. What is behind the badge is more than the band
 * ever said: the admission, the report link, and the credit for the photograph.
 *
 * A native <dialog>: the browser brings the focus trap, Escape and the top layer with it.
 */
export function HonestyBadge() {
  const t = useTranslations("honesty");
  const locale = useLocale();
  const ref = useRef<HTMLDialogElement>(null);
  const href = reportHref(t("subject"), t("body", { url: `${SITE_URL}/${locale}` }));

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label={t("badge")}
        title={t("badge")}
        className="honesty-pulse flex size-7 items-center justify-center rounded-full border border-line font-display text-sm text-secondary transition hover:border-accent hover:text-primary"
      >
        <span aria-hidden>!</span>
      </button>

      <dialog
        ref={ref}
        aria-labelledby="honesty-title"
        // A click that lands on the dialog element itself landed on the backdrop, not on the panel.
        onClick={(event) => { if (event.target === ref.current) ref.current?.close(); }}
        className="m-auto w-[min(92vw,32rem)] rounded-lg border border-line bg-elevated p-6 text-secondary backdrop-blur-md backdrop:bg-black/70"
      >
        <h2 id="honesty-title" className="font-display text-lg text-primary">{t("title")}</h2>
        <p className="mt-3 text-sm leading-relaxed">{t("text")}</p>
        <p className="mt-4">
          <a href={href} className="text-sm underline decoration-accent underline-offset-4 hover:text-primary">
            {t("report")}
          </a>
        </p>
        <div className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-muted">
          <p>{t("earth")}</p>
          <p className="mt-1">
            <a
              href={EARTH_SOURCE_URL}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-transparent underline-offset-4 transition hover:decoration-current"
            >
              {t("earthCredit")}
            </a>
          </p>
        </div>
        <form method="dialog" className="mt-6 flex justify-end">
          <button className="rounded-full border border-line px-4 py-1.5 text-sm text-secondary transition hover:border-accent hover:text-primary">
            {t("close")}
          </button>
        </form>
      </dialog>
    </>
  );
}

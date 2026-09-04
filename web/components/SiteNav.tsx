"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { EARTH_SOURCE_URL, REPO_URL, reportHref, SITE_URL } from "@/lib/report";
import { Sheet } from "./Sheet";

const FLAG: Record<Locale, string> = { en: "🇬🇧", ru: "🇷🇺", ky: "🇰🇬", tr: "🇹🇷" };
/**
 * Written uppercase here rather than derived: toUpperCase() is forbidden in this codebase because
 * it turns Turkish "i" into "I" instead of "İ", and a locale code must never be localised anyway.
 */
const CODE: Record<Locale, string> = { en: "EN", ru: "RU", ky: "KY", tr: "TR" };

type Panel = "menu" | "about" | "contact" | "language";

/**
 * Everything on the right of the site bar: About, Contact and the language.
 *
 * On a phone the bar has room for two small controls, so the language is a flag and a code and the
 * rest lives behind a menu. On a wider screen the three sit side by side. `honesty` adds the badge
 * that carries the site's admission on the home page, where the band is a badge (ADR-024); it opens
 * the same panel as Contact, because it is the same sentence and the same address.
 */
export function SiteNav({ honesty = false }: { honesty?: boolean }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [panel, setPanel] = useState<Panel | null>(null);
  const close = () => setPanel(null);

  const choose = (next: Locale) => {
    close();
    if (next === locale) return;
    // usePathname() drops the query, and on the home page the query is which event you are on.
    // Reading it here is safe: this only ever runs from a click, in the browser.
    router.replace(`${pathname}${window.location.search}`, { locale: next });
  };

  const url = `${SITE_URL}/${locale}${pathname === "/" ? "" : pathname}`;
  const mailto = reportHref(t("honesty.subject"), t("honesty.body", { url }));

  const quiet = "rounded-full border border-line px-2.5 py-1 text-secondary transition hover:border-accent hover:text-primary";
  const plain = "text-secondary transition hover:text-primary";

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-4">
        {honesty && (
          <button
            type="button"
            onClick={() => setPanel("contact")}
            aria-label={t("honesty.badge")}
            title={t("honesty.badge")}
            className="honesty-pulse flex size-7 items-center justify-center rounded-full border border-line font-display text-sm text-secondary transition hover:border-accent hover:text-primary"
          >
            <span aria-hidden>!</span>
          </button>
        )}

        <button type="button" onClick={() => setPanel("about")} className={`hidden sm:inline ${plain}`}>
          {t("nav.about")}
        </button>
        <button type="button" onClick={() => setPanel("contact")} className={`hidden sm:inline ${plain}`}>
          {t("nav.contact")}
        </button>

        <button
          type="button"
          onClick={() => setPanel("language")}
          aria-label={t("nav.language")}
          className={`flex items-center gap-1.5 text-xs ${quiet}`}
        >
          <span aria-hidden className="text-sm leading-none">{FLAG[locale]}</span>
          <span className="tabular">{CODE[locale]}</span>
        </button>

        <button
          type="button"
          onClick={() => setPanel("menu")}
          aria-label={t("nav.menu")}
          className={`flex size-7 items-center justify-center text-base sm:hidden ${quiet} px-0 py-0`}
        >
          <span aria-hidden>&#8801;</span>
        </button>
      </div>

      {/* The phone's menu. About and Contact only: the language has its own control in the bar. */}
      <Sheet open={panel === "menu"} onClose={close} title={t("nav.menu")}>
        <ul className="-mx-1 flex flex-col">
          <li>
            <button type="button" onClick={() => setPanel("about")} className="w-full rounded-md px-1 py-3 text-left text-base text-primary">
              {t("nav.about")}
            </button>
          </li>
          <li className="border-t border-line">
            <button type="button" onClick={() => setPanel("contact")} className="w-full rounded-md px-1 py-3 text-left text-base text-primary">
              {t("nav.contact")}
            </button>
          </li>
        </ul>
      </Sheet>

      <Sheet open={panel === "language"} onClose={close} title={t("nav.language")}>
        <ul className="grid grid-cols-2 gap-2">
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => choose(l)}
                aria-current={l === locale ? "true" : undefined}
                className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition ${
                  l === locale ? "border-accent/60 text-primary" : "border-line text-secondary hover:border-accent/40 hover:text-primary"
                }`}
              >
                <span aria-hidden className="text-xl leading-none">{FLAG[l]}</span>
                <span className="min-w-0">
                  <span className="block font-display text-sm tabular">{CODE[l]}</span>
                  <span className="block truncate text-xs text-muted">{t(`locales.${l}`)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet open={panel === "about"} onClose={close} title={t("about.title")}>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>{t("about.lead")}</p>
          {/* His own sentence, and the reason the site exists at all. */}
          <blockquote className="border-l-2 border-accent/60 pl-4 font-display italic leading-relaxed text-primary">
            {t("about.quote")}
          </blockquote>
          <p>{t("about.why")}</p>
          <p>{t("about.who")}</p>
        </div>
      </Sheet>

      <Sheet open={panel === "contact"} onClose={close} title={t("honesty.title")}>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>{t("honesty.text")}</p>
          <ul className="flex flex-col gap-2">
            <li>
              <a href={mailto} className="inline-flex items-center gap-2 underline decoration-accent underline-offset-4 hover:text-primary">
                {t("honesty.report")}
              </a>
            </li>
            <li>
              <a
                href={`${REPO_URL}/issues/new`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 underline decoration-accent underline-offset-4 hover:text-primary"
              >
                {t("honesty.github")}
              </a>
            </li>
          </ul>
          <p className="border-t border-line pt-4 text-xs leading-relaxed text-muted">
            {t("honesty.earth")}{" "}
            <a
              href={EARTH_SOURCE_URL}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-transparent underline-offset-4 transition hover:decoration-current"
            >
              {t("honesty.earthCredit")}
            </a>
          </p>
        </div>
      </Sheet>
    </>
  );
}

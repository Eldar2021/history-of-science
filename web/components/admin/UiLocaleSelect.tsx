"use client";
import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { locales } from "@/i18n/routing";
import { setUiLocale } from "@/app/admin/actions";

export function UiLocaleSelect() {
  const locale = useLocale();
  const t = useTranslations();
  const form = useRef<HTMLFormElement>(null);
  return (
    <form ref={form} action={setUiLocale}>
      <select
        name="locale"
        aria-label={t("admin.uiLocale")}
        defaultValue={locale}
        onChange={() => form.current?.requestSubmit()}
        className="rounded-md border border-line bg-elevated px-2 py-1 text-sm text-primary"
      >
        {locales.map((l) => <option key={l} value={l}>{t(`locales.${l}`)}</option>)}
      </select>
    </form>
  );
}

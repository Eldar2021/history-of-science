import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ru", "ky", "tr"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});

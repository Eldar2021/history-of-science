import { locales, type Locale } from "@/i18n/routing";

/**
 * The absolute address the site answers on. Metadata, the sitemap and the error-report mailto all
 * need it, and a client component needs the same answer the server gave, so it is one constant
 * rather than something read from the request. The fallback is today's address; when the real domain
 * arrives (S14) it is one environment variable, and this line, that change.
 */
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://history-of-science.vercel.app").replace(/\/+$/, "");

/** A path that already carries its locale, made absolute: "/tr/event/x" → "https://…/tr/event/x". */
export const absolute = (path: string) => `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * `alternates` for a page that exists in all four languages. Without this the four translations of
 * one event compete with each other in search results instead of pointing at one another.
 * `path` carries no locale prefix: "" for the home page, "/event/newton-principia" for an event.
 */
export function alternates(locale: Locale, path = "") {
  return {
    canonical: absolute(`/${locale}${path}`),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, absolute(`/${l}${path}`)])),
      "x-default": absolute(`/en${path}`),
    },
  };
}

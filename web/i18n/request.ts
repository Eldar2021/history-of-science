import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Site pages get their locale from the URL segment. Admin pages have no prefix, so
 * `requestLocale` is empty there; they use the signed-in profile's `ui_locale`
 * (ADR-018), falling back to the NEXT_LOCALE cookie, then to the default.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = (await requestLocale) ?? (await adminLocale());
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

async function adminLocale(): Promise<string | undefined> {
  // Imported lazily: next/headers must not be pulled into the static site render path.
  const [{ cookies }, { getStaff }] = await Promise.all([import("next/headers"), import("@/lib/auth")]);
  const staff = await getStaff().catch(() => null);
  if (staff) return staff.uiLocale;
  return (await cookies()).get("NEXT_LOCALE")?.value;
}

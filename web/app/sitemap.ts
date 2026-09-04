import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { getTimeline } from "@/lib/queries/timeline";
import { absolute } from "@/lib/site";

// The list is small and changes when an editor publishes, so an hour is a fair staleness.
export const revalidate = 3600;

/**
 * Every page in every language, each pointing at its own translations. The events are reachable from
 * the home page too, but the sitemap is what carries the hreflang set to a crawler.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Published events are the same set in every language; a translation missing only falls back.
  const events = await getTimeline("en");
  const paths = ["", ...events.map((e) => `/event/${e.slug}`)];

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: absolute(`/${locale}${path}`),
      changeFrequency: (path ? "monthly" : "weekly") as "monthly" | "weekly",
      priority: path ? 0.7 : 1,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, absolute(`/${l}${path}`)])),
      },
    })),
  );
}

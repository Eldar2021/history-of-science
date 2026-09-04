/**
 * Where an error report goes. One place, because both the band at the foot of an event page and the
 * badge on the home globe offer the same link (ADR-024).
 */

/** Fallback while no domain is chosen (S14); production sets NEXT_PUBLIC_REPORT_EMAIL. */
const REPORT_EMAIL = process.env.NEXT_PUBLIC_REPORT_EMAIL ?? "eldiiaralmazbekov@gmail.com";

/** Kept as a name; the value now has a real fallback so a report always carries a full address. */
export { SITE_ORIGIN as SITE_URL } from "@/lib/site";

/** The site is built in the open; an error report can also be an issue. */
export const REPO_URL = "https://github.com/Eldar2021/history-of-science";

export function reportHref(subject: string, body: string): string {
  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * NASA's Blue Marble, the photograph the globe wears. NASA imagery is not copyrighted and carries
 * no usage restriction; NASA asks only to be credited, which the honesty dialog does (ADR-024).
 */
export const EARTH_SOURCE_URL =
  "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73751/world.topo.bathy.200407.3x5400x2700.jpg";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The share card, drawn on the server with next/og. It is the first thing anyone sees of the site in
 * a Telegram or WhatsApp thread, so it wears the site's palette and its display face rather than a
 * default sans. The font file is traced into the deployment by outputFileTracingIncludes.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export const COLORS = {
  base: "#2e2b25",
  elevated: "#3b372f",
  primary: "#f9f4ed",
  secondary: "#dcd3c4",
  muted: "#c0b6a5",
  accent: "#f6a06b",
  sage: "#aebf92",
};

/** Literata, the site's display face. SIL Open Font License; the file lives in web/assets. */
export async function displayFont() {
  const data = await readFile(join(process.cwd(), "assets", "Literata-Regular.ttf"));
  return [{ name: "Literata", data, style: "normal" as const, weight: 400 as const }];
}

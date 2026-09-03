/** Data-cache tags (doc/04 "Admin → site otomatik yayın akışı"). The admin save action updates them. */
export const TIMELINE_TAG = "timeline";
export const eventTag = (slug: string) => `event:${slug}`;
/** Safety net: even without an explicit update, cached reads refresh within 5 minutes. */
export const FALLBACK_REVALIDATE_SECONDS = 300;

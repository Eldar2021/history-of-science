/**
 * A picture is either an object in the `images` bucket or a full address someone pasted into the
 * admin (Wikimedia, most often). Both are allowed, so both have to resolve to something a browser
 * can fetch.
 */
export function imageUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/images/${pathOrUrl.replace(/^\/+/, "")}`;
}

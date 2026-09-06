#!/usr/bin/env node
/**
 * Read an image's licence from the Wikimedia Commons API and build its caption.
 *
 * doc/icerik.md: "Lisans tahmin edilmez." A licence is a legal claim, so it is never something the
 * model asserts — it is read from the file's own metadata here, and a file whose licence is not free
 * is refused rather than reported.
 *
 *   node commons.mjs --search "Thales of Miletus" [--limit 8]   # find candidate files
 *   node commons.mjs "File:Newton_Cannon.svg" [more files...]    # licence + caption for the drafts
 *
 * The caption it prints is exactly the `"Author · Licence · URL"` title the loader's contract check
 * requires, so a figure can be pasted into a body without retyping anything.
 *
 * Exit codes: 0 = all requested files are free to use, 1 = at least one is not (or does not exist).
 */
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "Uchkun/1.0 (https://github.com/Eldar2021/history-of-science; science-history timeline)";

const get = async (params) => {
  const url = `${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons ${res.status}: ${url}`);
  return res.json();
};

/** extmetadata values are HTML fragments; the caption needs plain text on one line. */
const plain = (html) =>
  (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * The site publishes public domain, CC0, CC BY and CC BY-SA only (doc/icerik.md). NonCommercial and
 * NoDerivatives are not free; "fair use" is not a licence we can carry. Decided on the machine-readable
 * `License` tag, falling back to the short name, and anything unrecognised counts as not free.
 */
function freedom(meta) {
  const tag = (meta.License?.value ?? "").toLowerCase();
    const short = plain(meta.LicenseShortName?.value);
  const both = `${tag} ${short.toLowerCase()}`;
  if (/\bnc\b|noncommercial|\bnd\b|noderiv|fair use|non-free/.test(both))
    return { free: false, reason: `not a free licence: ${short || tag || "unknown"}` };
  if (/^pd|public.?domain|cc0|cc.?by|no restrictions/.test(tag) || /public domain|cc0|cc by/i.test(short))
    return { free: true };
  return { free: false, reason: `unrecognised licence, check by hand: ${short || tag || "none stated"}` };
}

async function describe(title) {
  const data = await get({
    action: "query", titles: title, prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size", iiextmetadatafilter: "Artist|Credit|License|LicenseShortName|LicenseUrl|UsageTerms|DateTimeOriginal",
  });
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) return { file: title, error: "no such file on Commons" };
  const info = page.imageinfo?.[0];
  if (!info) return { file: title, error: "no image info (is it a file page?)" };

  const meta = info.extmetadata ?? {};
  // Credit line: the author if Commons knows one, otherwise the credit field, otherwise say so plainly
  // rather than leaving the caption looking complete.
  // Commons prefixes an uploader's name with "user:"; a caption under a picture should not read like a
  // database row. The QS:P571 tail on dates is Wikidata bookkeeping, not part of the date.
  const artist = (plain(meta.Artist?.value) || plain(meta.Credit?.value) || "Unknown author")
    .replace(/^user:\s*/i, "");
  const license = plain(meta.LicenseShortName?.value) || plain(meta.UsageTerms?.value) || "";
  const source_url = page.title
    ? `https://commons.wikimedia.org/wiki/${page.title.replace(/ /g, "_")}`
    : info.descriptionurl;

  return {
    file: page.title,
    ...freedom(meta),
    // Commons appends utm_* parameters to this URL; the site stores the bare file address.
    path: info.url.split("?")[0],
    credit: artist,
    license,
    license_url: plain(meta.LicenseUrl?.value) || null,
    source_url,
    date: (plain(meta.DateTimeOriginal?.value) || "").replace(/\s*date QS:.*$/, "") || null,
    mime: info.mime,
    size: info.width && info.height ? `${info.width}×${info.height}` : null,
    // The exact Markdown title the draft contract wants: ![alt](path "caption").
    caption: `${artist} · ${license} · ${source_url}`,
  };
}

const args = process.argv.slice(2);
if (args[0] === "--search") {
  const limit = args.includes("--limit") ? args[args.indexOf("--limit") + 1] : "8";
  const term = args[1];
  if (!term) throw new Error("usage: commons.mjs --search \"term\" [--limit n]");
  const data = await get({ action: "query", list: "search", srsearch: `${term} filetype:bitmap|drawing`, srnamespace: "6", srlimit: limit });
  const hits = data.query?.search ?? [];
  if (!hits.length) console.log("no files found; try a different term (a person's name, a book title, an instrument)");
  for (const h of hits) console.log(h.title);
  process.exit(0);
}

if (!args.length) throw new Error('usage: commons.mjs "File:Name.jpg" [...] | --search "term"');
const results = [];
for (const a of args) results.push(await describe(a.startsWith("File:") ? a : `File:${a}`));
console.log(JSON.stringify(results, null, 2));
process.exit(results.every((r) => r.free) ? 0 : 1);

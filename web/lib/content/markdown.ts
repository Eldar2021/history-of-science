/**
 * Pure helpers around the event body. The body is GitHub-flavoured Markdown (ADR-033); everything
 * here is the part that has to hold outside a React tree, so it can be unit tested without Next.
 */

/** The alert kinds a body may open with `> [!NOTE]`. GitHub's five, plus one of our own. */
export const ALERT_KINDS = ["note", "tip", "important", "warning", "caution", "theory"] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

const ALERT_RE = /^\s*\[!([A-Za-z]+)\]\s*\n?/;

/** `[!NOTE] rest` -> the kind and what is left of the line. Unknown kinds are left alone. */
export function parseAlert(text: string): { kind: AlertKind; rest: string } | null {
  const m = ALERT_RE.exec(text);
  if (!m) return null;
  const kind = m[1].toLowerCase() as AlertKind;
  if (!ALERT_KINDS.includes(kind)) return null;
  return { kind, rest: text.slice(m[0].length) };
}

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** The eleven-character id in any of the shapes a reader might paste, or null if this is not YouTube. */
export function youtubeId(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;
  const path = url.pathname.split("/").filter(Boolean);
  const candidate =
    url.hostname.endsWith("youtu.be") ? path[0]
    : path[0] === "watch" ? url.searchParams.get("v")
    : path[0] === "embed" || path[0] === "shorts" || path[0] === "live" ? path[1]
    : null;
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

export type ImageCredit = { credit: string; license: string | null; source: string | null };

/**
 * The credit an image carries in its Markdown title: `![alt](url "Author · License · https://source")`.
 * Attribution is mandatory for every picture we publish (CLAUDE.md), and a caption is the only place
 * a Markdown image can carry it. `·` and `|` both separate; extra parts join back into the credit.
 */
export function parseImageCredit(title: string | null | undefined): ImageCredit | null {
  if (!title) return null;
  const parts = title.split(/\s*[·|]\s*/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  const isUrl = (s: string) => /^https?:\/\//i.test(s);
  const source = parts.find(isUrl) ?? null;
  const rest = parts.filter((p) => !isUrl(p));
  if (!rest.length) return null;
  return { credit: rest[0], license: rest.slice(1).join(" · ") || null, source };
}

/**
 * Images in the body that carry no credit at all. The admin preview warns about these; it does not
 * refuse the save, because a draft is allowed to be unfinished.
 */
export function uncreditedImages(markdown: string): string[] {
  const out: string[] = [];
  // ![alt](src "title") — the title, when present, is what carries the credit.
  const re = /!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?(?:\s+("[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
  for (let m = re.exec(markdown); m; m = re.exec(markdown)) {
    const title = m[3] ? m[3].slice(1, -1) : null;
    if (!parseImageCredit(title)) out.push(m[1] || m[2]);
  }
  return out;
}

/**
 * The short fields (why it matters, if you were there) are one sentence or two and never carry
 * structure, so they keep this two-rule renderer rather than pulling the Markdown pipeline in.
 */
export type Inline = { type: "text" | "em" | "strong"; text: string };

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    out.push(m[1] !== undefined ? { type: "strong", text: m[1] } : { type: "em", text: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}

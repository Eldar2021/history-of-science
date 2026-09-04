import ReactMarkdown, { type Components } from "react-markdown";
import type { Element } from "hast";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useTranslations } from "next-intl";
import { remarkUchkun } from "@/lib/content/remarkUchkun";
import { ALERT_KINDS, parseImageCredit, type AlertKind } from "@/lib/content/markdown";
import "katex/dist/katex.min.css";

/**
 * The event body, rendered the same way on the site and in the admin preview. Deliberately not a
 * client component: on the site it only ever runs on the server, so the parser costs the reader
 * nothing; the admin form imports the same file and pays for it there, behind a login (ADR-033).
 *
 * Raw HTML stays off. Everything a body needs has Markdown for it, and bodies are written by a
 * pipeline as well as by hand.
 */

/** Callouts have no hue of their own; they borrow the discipline ramp so the page keeps one palette. */
const ALERT_COLOR: Record<AlertKind, string> = {
  note: "var(--discipline-physics)",
  tip: "var(--sage)",
  important: "var(--discipline-mathematics)",
  warning: "var(--accent)",
  caution: "var(--discipline-medicine)",
  theory: "var(--discipline-astronomy)",
};

/** remarkUchkun writes `data-*`; whether that survives as written or camel-cased is not ours to assume. */
function marker(node: Element | undefined, name: string): unknown {
  const props = node?.properties;
  if (!props) return undefined;
  return props[`data-${name}`] ?? props[`data${name[0].toUpperCase()}${name.slice(1)}`];
}

function YouTube({ id, title }: { id: string; title: string }) {
  return (
    <div className="my-5 overflow-hidden rounded-image border border-line bg-black">
      <iframe
        // nocookie, and no related videos at the end: the reader came here to read.
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full border-0"
      />
    </div>
  );
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const t = useTranslations("content");

  const components: Components = {
    h1: ({ children }) => <h3 className="pt-2 font-display text-title-lg text-primary">{children}</h3>,
    h2: ({ children }) => <h3 className="pt-2 font-display text-title-lg text-primary">{children}</h3>,
    h3: ({ children }) => <h3 className="pt-2 font-display text-title text-primary">{children}</h3>,
    h4: ({ children }) => <h4 className="pt-1 font-display text-title text-secondary">{children}</h4>,
    ul: ({ children }) => <ul className="list-disc space-y-1 pl-5 marker:text-muted">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5 marker:text-muted">{children}</ol>,
    hr: () => <hr className="my-6 border-line" />,
    a: ({ href, children }) => (
      <a href={href} rel="noopener" className="text-accent-text underline decoration-line underline-offset-4 hover:decoration-current">
        {children}
      </a>
    ),
    code: ({ children }) => <code className="rounded bg-raised px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
    pre: ({ children }) => (
      <pre className="overflow-x-auto rounded-md bg-raised p-3 text-small leading-relaxed [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-small">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border-b border-line px-2 py-1.5 text-left font-medium text-secondary">{children}</th>,
    td: ({ children }) => <td className="border-b border-line px-2 py-1.5 align-top">{children}</td>,

    blockquote: ({ node, children }) => {
      const kind = marker(node, "alert");
      if (typeof kind !== "string" || !(ALERT_KINDS as readonly string[]).includes(kind)) {
        return <blockquote className="border-l-2 border-line pl-4 italic text-secondary">{children}</blockquote>;
      }
      const color = ALERT_COLOR[kind as AlertKind];
      return (
        <div
          className="rounded-lg border-l-2 px-4 py-3"
          style={{ borderColor: color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
        >
          <p className="text-label uppercase tracking-wider" style={{ color }}>{t(`alert.${kind}`)}</p>
          <div className="mt-1.5 space-y-2">{children}</div>
        </div>
      );
    },

    // remarkUchkun turns a lone YouTube link into this; nothing else in a body renders a bare div.
    div: ({ node, children, ...props }) => {
      const id = marker(node, "youtube");
      if (typeof id === "string") return <YouTube id={id} title={t("videoTitle")} />;
      return <div {...props}>{children}</div>;
    },

    img: ({ node, src, alt, title }) => {
      const image = (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" className="w-full rounded-image" />
      );
      // Inline in a sentence: no <figure>, which may not sit inside the <p> around it.
      if (marker(node, "figure") === undefined) return image;
      const credit = parseImageCredit(title);
      return (
        <figure className="my-5">
          {image}
          {credit && (
            <figcaption className="mt-1.5 text-label text-muted">
              {credit.source ? (
                <a href={credit.source} rel="noopener" className="underline underline-offset-2">{credit.credit}</a>
              ) : credit.credit}
              {credit.license && ` · ${credit.license}`}
            </figcaption>
          )}
        </figure>
      );
    },
  };

  return (
    <div className={className ?? "space-y-3 text-body text-primary"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkUchkun]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Markdown } from "@/components/content/Markdown";
import { uncreditedImages } from "@/lib/content/markdown";

type Props = { name: string; defaultValue: string; label: string; hint: string; rows?: number };

/**
 * The body editor: Write and Preview, the way GitHub does it, because the preview is the only way to
 * see what a callout or an embedded video will actually look like. The preview renders with the very
 * same component the site uses, so what is shown here is what a reader gets (ADR-033).
 *
 * The textarea is only hidden, never unmounted: the form posts its value either way.
 */
export function MarkdownField({ name, defaultValue, label, hint, rows = 18 }: Props) {
  const t = useTranslations("admin.events.form");
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const id = useId();
  const uncredited = preview ? uncreditedImages(value) : [];

  const tab = (active: boolean) =>
    `rounded-t-md border-b-2 px-3 py-1.5 text-sm transition ${
      active ? "border-accent text-primary" : "border-transparent text-muted hover:text-secondary"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line">
        <div className="flex items-center gap-1">
          <label htmlFor={id} className="mr-2 self-center text-sm text-secondary">{label}</label>
          <button type="button" onClick={() => setPreview(false)} aria-pressed={!preview} className={tab(!preview)}>
            {t("write")}
          </button>
          <button type="button" onClick={() => setPreview(true)} aria-pressed={preview} className={tab(preview)}>
            {t("preview")}
          </button>
        </div>
        <Link href="/admin/help/markdown" target="_blank" className="pb-1.5 text-xs text-accent-text underline-offset-4 hover:underline">
          {t("markdownHelp")}
        </Link>
      </div>

      <textarea
        id={id}
        name={name}
        rows={rows}
        hidden={preview}
        defaultValue={defaultValue}
        aria-describedby={`${id}-hint`}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 w-full rounded-md border border-line bg-elevated px-3 py-2 font-mono text-sm leading-relaxed text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />

      {preview && (
        <div className="mt-2 rounded-md border border-line bg-elevated px-4 py-3" style={{ minHeight: `${rows * 1.5}rem` }}>
          {uncredited.length > 0 && (
            <p className="mb-3 rounded-md border border-accent/40 px-3 py-2 text-xs text-accent-text">
              {t("uncredited", { names: uncredited.join(", ") })}
            </p>
          )}
          {value.trim() ? <Markdown source={value} /> : <p className="text-sm text-muted">{hint}</p>}
        </div>
      )}

      <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

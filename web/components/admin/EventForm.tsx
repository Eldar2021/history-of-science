"use client";
import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n/routing";
import { formatYear } from "@/lib/i18n/formatYear";
import { PRECISIONS, STATUSES, SUMMARY_SOFT_MAX, TITLE_SOFT_MAX, type EventFormValues } from "@/lib/admin/eventForm";
import { slugify } from "@/lib/admin/slug";
import { saveEvent, type SaveState } from "@/app/admin/events/actions";
import type { Discipline } from "@/lib/queries/types";

type Props = { initial: EventFormValues; disciplines: Discipline[]; uiLocale: Locale };

const input = "w-full rounded-md border border-line bg-elevated px-3 py-2 text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent";
const label = "block text-sm text-secondary";

/** The event editor. Uncontrolled fields; the form remounts on every server answer (key=version) to keep typed values. */
export function EventForm({ initial, disciplines, uiLocale }: Props) {
  const t = useTranslations("admin.events");
  const tLocales = useTranslations("locales");
  const [state, action, pending] = useActionState<SaveState, FormData>(saveEvent, { values: initial, errors: {}, version: 0 });
  const v = state.values;
  const err = (k: keyof typeof state.errors) => state.errors[k] && <p className="mt-1 text-xs text-accent-text">{t(`errors.${state.errors[k]}`)}</p>;

  return (
    <form key={state.version} action={action} className="space-y-8">
      {state.errors.form && (
        <p role="alert" className="rounded-md border border-accent/40 bg-elevated px-3 py-2 text-sm text-accent-text">{t(`errors.${state.errors.form}`)}</p>
      )}
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <input type="hidden" name="edit_locale" value={v.edit_locale} />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-display text-lg text-primary">{t("form.when")}</legend>
        <YearField name="year" defaultValue={v.year} required label={t("form.year")} hint={t("form.yearHint")} locale={uiLocale} precision={v.precision} error={err("year")} />
        <YearField name="year_end" defaultValue={v.year_end} label={t("form.yearEnd")} hint={t("form.yearEndHint")} locale={uiLocale} precision={v.precision} error={err("year_end")} />
        <div>
          <label htmlFor="precision" className={label}>{t("form.precision")}</label>
          <select id="precision" name="precision" defaultValue={v.precision} className={`${input} mt-1`}>
            {PRECISIONS.map((p) => <option key={p} value={p}>{t(`precision.${p}`)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="importance" className={label}>{t("form.importance")}</label>
          <select id="importance" name="importance" defaultValue={v.importance} className={`${input} mt-1`}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} · {t(`importanceLevels.${n}`)}</option>)}
          </select>
          {err("importance")}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 font-display text-lg text-primary">
          {t("form.text")} <span className="text-sm text-muted">({tLocales(v.edit_locale)})</span>
        </legend>
        <TextField name="title" defaultValue={v.title} required label={t("form.title")} softMax={TITLE_SOFT_MAX} warn={t("form.tooLong", { max: TITLE_SOFT_MAX })} error={err("title")} />
        <TextField name="summary" defaultValue={v.summary} required rows={2} label={t("form.summary")} hint={t("form.summaryHint")} softMax={SUMMARY_SOFT_MAX} warn={t("form.tooLong", { max: SUMMARY_SOFT_MAX })} error={err("summary")} />
        <TextField name="body" defaultValue={v.body} rows={14} label={t("form.body")} hint={t("form.bodyHint")} mono />
        <TextField name="why_it_matters" defaultValue={v.why_it_matters} rows={3} label={t("form.whyItMatters")} hint={t("form.whyItMattersHint")} />
        <TextField name="if_you_were_there" defaultValue={v.if_you_were_there} rows={2} label={t("form.ifYouWereThere")} hint={t("form.ifYouWereThereHint")} />
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-display text-lg text-primary">{t("form.disciplines")}</legend>
        <div className="flex flex-wrap gap-2">
          {disciplines.map((d) => (
            <label key={d.slug} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1 text-sm text-secondary has-[:checked]:border-accent has-[:checked]:bg-elevated has-[:checked]:text-primary">
              <input type="checkbox" name="disciplines" value={d.slug} defaultChecked={v.disciplines.includes(d.slug)} className="accent-(--accent)" />
              {d.name}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">{t("form.disciplinesHint")}</p>
        {err("disciplines")}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 font-display text-lg text-primary">{t("form.publishing")}</legend>
        <div>
          <label htmlFor="source_locale" className={label}>{t("form.sourceLocale")}</label>
          <select id="source_locale" name="source_locale" defaultValue={v.source_locale} className={`${input} mt-1`}>
            {locales.map((l) => <option key={l} value={l}>{tLocales(l)}</option>)}
          </select>
        </div>
        <SlugField defaultValue={v.slug} label={t("form.slug")} hint={t("form.slugHint")} error={err("slug")} />
        <div>
          <label htmlFor="status" className={label}>{t("form.status")}</label>
          <select id="status" name="status" defaultValue={v.status} aria-describedby="status-hint" className={`${input} mt-1`}>
            {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </select>
          <p id="status-hint" className="mt-1 text-xs text-muted">{t("form.statusHint")}</p>
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-ink hover:bg-accent-hover disabled:opacity-60">
          {pending ? t("form.saving") : t("form.save")}
        </button>
      </div>
    </form>
  );
}

function YearField({ name, defaultValue, required, label: text, hint, locale, precision, error }: {
  name: string; defaultValue: string; required?: boolean; label: string; hint: string; locale: Locale; precision: EventFormValues["precision"]; error: React.ReactNode;
}) {
  const [value, setValue] = useState(defaultValue);
  const n = Number(value);
  const preview = /^-?\d+$/.test(value) && n !== 0 ? formatYear(n, precision, locale) : null;
  return (
    <div>
      <label htmlFor={name} className={label}>{text}</label>
      <input id={name} name={name} type="number" step={1} required={required} defaultValue={defaultValue} aria-describedby={`${name}-hint`} onChange={(e) => setValue(e.target.value)} className={`${input} mt-1 font-display tabular`} />
      <p id={`${name}-hint`} className="mt-1 text-xs text-muted">{preview ? <strong className="text-secondary">{preview}</strong> : hint}</p>
      {error}
    </div>
  );
}

function TextField({ name, defaultValue, required, rows, label: text, hint, softMax, warn, error, mono }: {
  name: string; defaultValue: string; required?: boolean; rows?: number; label: string; hint?: string; softMax?: number; warn?: string; error?: React.ReactNode; mono?: boolean;
}) {
  const [len, setLen] = useState(defaultValue.length);
  const over = softMax !== undefined && len > softMax;
  const cls = `${input} mt-1 ${mono ? "font-mono text-sm leading-relaxed" : ""}`;
  const hintId = `${name}-hint`;
  return (
    <div>
      <div className="flex justify-between">
        <label htmlFor={name} className={label}>{text}</label>
        {softMax !== undefined && <span aria-hidden className={`text-xs ${over ? "text-accent-text" : "text-muted"}`}>{len}/{softMax}</span>}
      </div>
      {rows ? (
        <textarea id={name} name={name} rows={rows} required={required} defaultValue={defaultValue} aria-describedby={hintId} onChange={(e) => setLen(e.target.value.length)} className={cls} />
      ) : (
        <input id={name} name={name} type="text" required={required} defaultValue={defaultValue} aria-describedby={hintId} onChange={(e) => setLen(e.target.value.length)} className={cls} />
      )}
      <p id={hintId} className={`mt-1 text-xs ${over && warn ? "text-accent-text" : "text-muted"}`}>{over && warn ? warn : hint}</p>
      {error}
    </div>
  );
}

/** Empty = derived from the title on save; the preview shows what that would be. */
function SlugField({ defaultValue, label: text, hint, error }: { defaultValue: string; label: string; hint: string; error: React.ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <label htmlFor="slug" className={label}>{text}</label>
      <input id="slug" name="slug" type="text" defaultValue={defaultValue} aria-describedby="slug-hint" onChange={(e) => setValue(e.target.value)} onBlur={(e) => { const s = slugify(e.target.value); e.target.value = s; setValue(s); }} className={`${input} mt-1 font-mono text-sm`} />
      <p id="slug-hint" className="mt-1 text-xs text-muted">{value ? `/event/${value}` : hint}</p>
      {error}
    </div>
  );
}

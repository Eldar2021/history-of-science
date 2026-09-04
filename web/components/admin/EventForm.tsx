"use client";
import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n/routing";
import { formatYear } from "@/lib/i18n/formatYear";
import { formatPlaceParts, type PlacePrecision } from "@/lib/i18n/formatPlace";
import {
  PLACE_PRECISIONS, PRECISIONS, SOURCE_KINDS, STATUSES, SUMMARY_SOFT_MAX, TITLE_SOFT_MAX,
  emptyLink, emptyPerson, emptySource,
  type EventFormValues, type LinkValues, type PersonValues, type SourceValues,
} from "@/lib/admin/eventForm";
import { slugify } from "@/lib/admin/slug";
import { MarkdownField } from "./MarkdownField";
import { saveEvent, type SaveState } from "@/app/admin/events/actions";
import type { Discipline } from "@/lib/queries/types";

export type EventOption = { slug: string; year: number; title: string };
type Props = { initial: EventFormValues; disciplines: Discipline[]; uiLocale: Locale; eventOptions: EventOption[] };

const field = "w-full rounded-lg border border-line bg-elevated px-3 py-2 text-primary outline-none transition focus-visible:ring-2 focus-visible:ring-accent";
const label = "block text-sm text-secondary";
const legend = "mb-3 text-label uppercase tracking-wider text-muted";
const hint = "mt-1 text-xs text-muted";
const ghostButton = "rounded-pill border border-line px-3 py-1 text-sm text-secondary transition hover:border-accent hover:text-primary";

/**
 * The event editor. All four languages live in the form at once (ADR-034): the tabs only decide what
 * is on screen, every language's inputs stay in the DOM, and one save writes every language that
 * carries text. Switching tabs can no longer lose what was typed.
 *
 * Fields are uncontrolled; the form remounts on every server answer (key=version) so typed values
 * come back exactly as they were sent.
 */
export function EventForm({ initial, disciplines, uiLocale, eventOptions }: Props) {
  const t = useTranslations("admin.events");
  const tLocales = useTranslations("locales");
  const [state, action, pending] = useActionState<SaveState, FormData>(saveEvent, { values: initial, errors: {}, version: 0 });
  const v = state.values;
  const [tab, setTab] = useState<Locale>(v.edit_locale);
  const [dirty, setDirty] = useState(false);
  // Which languages carry text, tracked live so the ∅ on a tab disappears as soon as it is typed in.
  const [filled, setFilled] = useState<Record<Locale, boolean>>(
    () => Object.fromEntries(locales.map((l) => [l, Boolean(v.translations[l].title)])) as Record<Locale, boolean>,
  );

  const err = (k: string) => state.errors[k] && <p className="mt-1 text-xs text-accent-text">{t(`errors.${state.errors[k]}`)}</p>;

  // A reload or a closed tab is the only navigation the browser lets us stop; in-app links do not fire this.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <form
      key={state.version}
      action={action}
      onChange={() => setDirty(true)}
      onSubmit={() => setDirty(false)}
      className="space-y-10"
    >
      {state.errors.form && (
        <p role="alert" className="rounded-lg border border-accent/40 bg-elevated px-4 py-3 text-sm text-accent-text">{t(`errors.${state.errors.form}`)}</p>
      )}
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <input type="hidden" name="edit_locale" value={tab} />

      <Card>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className={legend}>{t("form.when")}</legend>
          <YearField name="year" defaultValue={v.year} label={t("form.year")} hint={t("form.yearHint")} locale={uiLocale} precision={v.precision} error={err("year")} />
          <YearField name="year_end" defaultValue={v.year_end} label={t("form.yearEnd")} hint={t("form.yearEndHint")} locale={uiLocale} precision={v.precision} error={err("year_end")} />
          <div>
            <label htmlFor="precision" className={label}>{t("form.precision")}</label>
            <select id="precision" name="precision" defaultValue={v.precision} className={`${field} mt-1`}>
              {PRECISIONS.map((p) => <option key={p} value={p}>{t(`precision.${p}`)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="importance" className={label}>{t("form.importance")}</label>
            <select id="importance" name="importance" defaultValue={v.importance} className={`${field} mt-1`}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} · {t(`importanceLevels.${n}`)}</option>)}
            </select>
            {err("importance")}
          </div>
        </fieldset>
      </Card>

      <Card>
        <PlaceFieldset initial={v} uiLocale={uiLocale} tab={tab} errors={state.errors} />
      </Card>

      <Card>
        <fieldset>
          <legend className={legend}>{t("form.disciplines")}</legend>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <label key={d.slug} className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-line px-3 py-1 text-sm text-secondary transition has-[:checked]:border-accent has-[:checked]:bg-elevated has-[:checked]:text-primary hover:border-accent">
                <input type="checkbox" name="disciplines" value={d.slug} defaultChecked={v.disciplines.includes(d.slug)} className="accent-(--accent)" />
                <span aria-hidden className="h-[7px] w-[7px] rounded-full" style={{ background: `var(--discipline-${d.slug})` }} />
                {d.name}
              </label>
            ))}
          </div>
          <p className={hint}>{t("form.disciplinesHint")}</p>
          {err("disciplines")}
        </fieldset>
      </Card>

      {/* The language tabs govern everything below until the publishing card. */}
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-line pb-3">
          <span className="mr-1 text-label uppercase tracking-wider text-muted">{t("form.language")}</span>
          {locales.map((l) => {
            const hasText = filled[l];
            const broken = Object.keys(state.errors).some((k) => k.startsWith(`${l}.`));
            return (
              <button
                key={l}
                type="button"
                onClick={() => setTab(l)}
                aria-pressed={l === tab}
                className={`rounded-pill border px-3 py-1 text-sm transition aria-pressed:border-accent aria-pressed:bg-elevated aria-pressed:text-primary ${
                  broken ? "border-accent/60 text-accent-text" : hasText ? "border-line text-secondary" : "border-line text-muted"
                }`}
              >
                {tLocales(l)}
                {l === v.source_locale && <span className="ml-1.5 text-label text-sage">{t("form.sourceMark")}</span>}
                {!hasText && l !== v.source_locale && <span className="ml-1.5 text-muted">∅</span>}
              </button>
            );
          })}
        </div>

        {locales.map((l) => (
          <div key={l} hidden={l !== tab} className="space-y-10">
            <Card>
              <fieldset className="space-y-4">
                <legend className={legend}>{t("form.text")} · {tLocales(l)}</legend>
                <TextField name={`tr_${l}_title`} defaultValue={v.translations[l].title} label={t("form.title")} softMax={TITLE_SOFT_MAX} warn={t("form.tooLong", { max: TITLE_SOFT_MAX })} error={err(`${l}.title`)} onValue={(text) => setFilled((f) => ({ ...f, [l]: Boolean(text.trim()) }))} />
                <TextField name={`tr_${l}_summary`} defaultValue={v.translations[l].summary} rows={2} label={t("form.summary")} hint={t("form.summaryHint")} softMax={SUMMARY_SOFT_MAX} warn={t("form.tooLong", { max: SUMMARY_SOFT_MAX })} error={err(`${l}.summary`)} />
                <MarkdownField name={`tr_${l}_body`} defaultValue={v.translations[l].body} label={t("form.body")} hint={t("form.bodyHint")} />
                <TextField name={`tr_${l}_why_it_matters`} defaultValue={v.translations[l].why_it_matters} rows={3} label={t("form.whyItMatters")} hint={t("form.whyItMattersHint")} />
                <TextField name={`tr_${l}_if_you_were_there`} defaultValue={v.translations[l].if_you_were_there} rows={2} label={t("form.ifYouWereThere")} hint={t("form.ifYouWereThereHint")} />
              </fieldset>
            </Card>
          </div>
        ))}

        <Card>
          <PeopleFieldset initial={v.people} tab={tab} error={err("people")} />
        </Card>
      </div>

      <Card>
        <ImageFieldset initial={v} error={err("image")} />
      </Card>

      <Card>
        <SourcesFieldset initial={v.sources} error={err("sources")} />
      </Card>

      <Card>
        <LinksFieldset initial={v.builds_on} options={eventOptions} uiLocale={uiLocale} error={err("builds_on")} />
      </Card>

      <Card>
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className={legend}>{t("form.publishing")}</legend>
          <div>
            <label htmlFor="source_locale" className={label}>{t("form.sourceLocale")}</label>
            <select id="source_locale" name="source_locale" defaultValue={v.source_locale} aria-describedby="source_locale-hint" className={`${field} mt-1`}>
              {locales.map((l) => <option key={l} value={l}>{tLocales(l)}</option>)}
            </select>
            <p id="source_locale-hint" className={hint}>{t("form.sourceLocaleHint")}</p>
          </div>
          <SlugField defaultValue={v.slug} label={t("form.slug")} hint={t("form.slugHint")} error={err("slug")} />
          <div>
            <label htmlFor="status" className={label}>{t("form.status")}</label>
            <select id="status" name="status" defaultValue={v.status} aria-describedby="status-hint" className={`${field} mt-1`}>
              {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
            </select>
            <p id="status-hint" className={hint}>{t("form.statusHint")}</p>
          </div>
        </fieldset>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-base/95 px-4 py-3 backdrop-blur">
        <button type="submit" disabled={pending} className="rounded-pill bg-accent px-5 py-2 font-medium text-accent-ink transition hover:bg-accent-hover disabled:opacity-60">
          {pending ? t("form.saving") : t("form.save")}
        </button>
        <button type="submit" name="stay" value="1" disabled={pending} className={`${ghostButton} px-4 py-2 disabled:opacity-60`}>
          {t("form.saveAndStay")}
        </button>
        {dirty && !pending && <span className="text-xs text-muted">{t("form.unsaved")}</span>}
      </div>
    </form>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-lg border border-line bg-elevated/40 p-5">{children}</section>;
}

/** A repeating block: rows the editor can add and remove, all posting under the same field names. */
function RowList<T>({ rows, setRows, blank, addLabel, emptyLabel, render }: {
  rows: T[];
  setRows: (next: T[]) => void;
  blank: () => T;
  addLabel: string;
  emptyLabel: string;
  render: (row: T, index: number) => React.ReactNode;
}) {
  const t = useTranslations("admin.events");
  return (
    <>
      {rows.length === 0 && <p className={hint}>{emptyLabel}</p>}
      <ul className="space-y-3">
        {rows.map((row, i) => (
          <li key={i} className="rounded-lg border border-line bg-base/40 p-3">
            {render(row, i)}
            <button
              type="button"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
              className="mt-2 text-xs text-muted underline underline-offset-4 transition hover:text-accent-text"
            >
              {t("form.removeRow")}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setRows([...rows, blank()])} className={`${ghostButton} mt-3`}>
        {addLabel}
      </button>
    </>
  );
}

function SourcesFieldset({ initial, error }: { initial: SourceValues[]; error: React.ReactNode }) {
  const t = useTranslations("admin.events");
  const [rows, setRows] = useState(initial);
  return (
    <fieldset>
      <legend className={legend}>{t("form.sources")}</legend>
      <p className="mb-3 text-xs text-muted">{t("form.sourcesHint")}</p>
      <RowList
        rows={rows}
        setRows={setRows}
        blank={emptySource}
        addLabel={t("form.addSource")}
        emptyLabel={t("form.sourcesEmpty")}
        render={(row) => (
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_10rem]">
            <input name="source_title" defaultValue={row.title} placeholder={t("form.sourceTitle")} aria-label={t("form.sourceTitle")} className={field} />
            <input name="source_url" type="url" defaultValue={row.url} placeholder="https://…" aria-label={t("form.sourceUrl")} className={`${field} font-mono text-sm`} />
            <select name="source_kind" defaultValue={row.kind} aria-label={t("form.sourceKind")} className={field}>
              {SOURCE_KINDS.map((k) => <option key={k} value={k}>{t(`sourceKind.${k}`)}</option>)}
            </select>
          </div>
        )}
      />
      {error}
    </fieldset>
  );
}

/**
 * People are shared rows: saving here creates the person if the slug is new, and renames them
 * everywhere if it is not. One set of rows, not one per tab - each row carries a name field for
 * every language and shows the one whose tab is open, so the posted arrays stay lined up.
 */
function PeopleFieldset({ initial, tab, error }: { initial: PersonValues[]; tab: Locale; error: React.ReactNode }) {
  const t = useTranslations("admin.events");
  const tLocales = useTranslations("locales");
  const [rows, setRows] = useState(initial);
  return (
    <fieldset>
      <legend className={legend}>{t("form.people")} <span className="normal-case tracking-normal text-muted">· {tLocales(tab)}</span></legend>
      <p className="mb-3 text-xs text-muted">{t("form.peopleHint")}</p>
      <RowList
        rows={rows}
        setRows={setRows}
        blank={emptyPerson}
        addLabel={t("form.addPerson")}
        emptyLabel={t("form.peopleEmpty")}
        render={(row) => (
          <div className="space-y-2">
            {locales.map((l) => (
              <input
                key={l}
                hidden={l !== tab}
                name={`person_name_${l}`}
                defaultValue={row.names[l]}
                placeholder={t("form.personName")}
                aria-label={`${t("form.personName")} (${l})`}
                className={field}
              />
            ))}
            <div className="grid gap-2 sm:grid-cols-[1fr_7rem_7rem]">
              <input name="person_role" defaultValue={row.role} placeholder={t("form.personRole")} aria-label={t("form.personRole")} className={field} />
              <input name="person_birth_year" type="number" step={1} defaultValue={row.birth_year} placeholder={t("form.personBirth")} aria-label={t("form.personBirth")} className={`${field} tabular`} />
              <input name="person_death_year" type="number" step={1} defaultValue={row.death_year} placeholder={t("form.personDeath")} aria-label={t("form.personDeath")} className={`${field} tabular`} />
            </div>
            <input type="hidden" name="person_slug" defaultValue={row.slug} />
          </div>
        )}
      />
      {error}
    </fieldset>
  );
}

function LinksFieldset({ initial, options, uiLocale, error }: { initial: LinkValues[]; options: EventOption[]; uiLocale: Locale; error: React.ReactNode }) {
  const t = useTranslations("admin.events");
  const [rows, setRows] = useState(initial);
  return (
    <fieldset>
      <legend className={legend}>{t("form.buildsOn")}</legend>
      <p className="mb-3 text-xs text-muted">{t("form.buildsOnHint")}</p>
      <datalist id="event-slugs">
        {options.map((o) => <option key={o.slug} value={o.slug}>{`${formatYear(o.year, "exact", uiLocale)} · ${o.title}`}</option>)}
      </datalist>
      <RowList
        rows={rows}
        setRows={setRows}
        blank={emptyLink}
        addLabel={t("form.addLink")}
        emptyLabel={t("form.buildsOnEmpty")}
        render={(row) => (
          <div className="grid gap-2 sm:grid-cols-[20rem_1fr]">
            <input name="link_slug" list="event-slugs" defaultValue={row.slug} placeholder={t("form.linkSlug")} aria-label={t("form.linkSlug")} className={`${field} font-mono text-sm`} />
            <input name="link_note" defaultValue={row.note} placeholder={t("form.linkNote")} aria-label={t("form.linkNote")} className={field} />
          </div>
        )}
      />
      {error}
    </fieldset>
  );
}

/** The card picture. The database refuses a picture with no credit, so the form asks for all of it. */
function ImageFieldset({ initial, error }: { initial: EventFormValues; error: React.ReactNode }) {
  const t = useTranslations("admin.events");
  const [path, setPath] = useState(initial.image_path);
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className={legend}>{t("form.image")}</legend>
      <div className="sm:col-span-2">
        <label htmlFor="image_path" className={label}>{t("form.imagePath")}</label>
        <input id="image_path" name="image_path" defaultValue={initial.image_path} onChange={(e) => setPath(e.target.value)} aria-describedby="image_path-hint" className={`${field} mt-1 font-mono text-sm`} />
        <p id="image_path-hint" className={hint}>{t("form.imagePathHint")}</p>
      </div>
      {path && (
        <>
          <div>
            <label htmlFor="image_credit" className={label}>{t("form.imageCredit")}</label>
            <input id="image_credit" name="image_credit" defaultValue={initial.image_credit} className={`${field} mt-1`} />
          </div>
          <div>
            <label htmlFor="image_license" className={label}>{t("form.imageLicense")}</label>
            <input id="image_license" name="image_license" defaultValue={initial.image_license} className={`${field} mt-1`} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="image_source_url" className={label}>{t("form.imageSourceUrl")}</label>
            <input id="image_source_url" name="image_source_url" type="url" defaultValue={initial.image_source_url} className={`${field} mt-1 font-mono text-sm`} />
          </div>
        </>
      )}
      {!path && (
        <>
          <input type="hidden" name="image_credit" value={initial.image_credit} />
          <input type="hidden" name="image_license" value={initial.image_license} />
          <input type="hidden" name="image_source_url" value={initial.image_source_url} />
        </>
      )}
      <div className="sm:col-span-2">{error}</div>
    </fieldset>
  );
}

/**
 * Where it happened. "No single place" hides the coordinate fields entirely, which is the same rule
 * the database enforces with place_needs_coords (ADR-025). The name is a word, so it belongs to a
 * language: one input per tab, only the open one on screen.
 */
function PlaceFieldset({ initial, uiLocale, tab, errors }: {
  initial: EventFormValues;
  uiLocale: Locale;
  tab: Locale;
  errors: Record<string, string | undefined>;
}) {
  const t = useTranslations("admin.events");
  const tLocales = useTranslations("locales");
  const [precision, setPrecision] = useState<PlacePrecision>(initial.place_precision);
  const [name, setName] = useState(initial.translations[tab].place_name);
  const preview = formatPlaceParts(name, precision, uiLocale);

  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className={legend}>{t("form.where")}</legend>
      <div>
        <label htmlFor="place_precision" className={label}>{t("form.placePrecision")}</label>
        <select
          id="place_precision"
          name="place_precision"
          defaultValue={initial.place_precision}
          aria-describedby="place_precision-hint"
          onChange={(e) => setPrecision(e.target.value as PlacePrecision)}
          className={`${field} mt-1`}
        >
          {PLACE_PRECISIONS.map((p) => <option key={p} value={p}>{t(`placePrecision.${p}`)}</option>)}
        </select>
        <p id="place_precision-hint" className={hint}>{t("form.placePrecisionHint")}</p>
      </div>
      <div className={precision === "unknown" ? "hidden" : undefined}>
        <span className={label}>{t("form.placeName")} <span className="text-muted">({tLocales(tab)})</span></span>
        {locales.map((l) => (
          <input
            key={l}
            hidden={l !== tab}
            name={`tr_${l}_place_name`}
            defaultValue={initial.translations[l].place_name}
            aria-label={`${t("form.placeName")} (${l})`}
            onChange={(e) => { if (l === tab) setName(e.target.value); }}
            className={`${field} mt-1`}
          />
        ))}
        <p className={hint}>
          {preview.value && preview.note ? <><strong className="text-secondary">{preview.value}</strong> — {preview.note}</> : t("form.placeNameHint")}
        </p>
        {errors[`${initial.source_locale}.place_name`] && (
          <p className="mt-1 text-xs text-accent-text">{t(`errors.${errors[`${initial.source_locale}.place_name`]}`)}</p>
        )}
      </div>
      <div className={precision === "unknown" ? "hidden" : undefined}>
        <label htmlFor="lat" className={label}>{t("form.lat")}</label>
        <input id="lat" name="lat" type="number" step="any" min={-90} max={90} defaultValue={initial.lat} className={`${field} mt-1 tabular`} />
        {errors.lat && <p className="mt-1 text-xs text-accent-text">{t(`errors.${errors.lat}`)}</p>}
      </div>
      <div className={precision === "unknown" ? "hidden" : undefined}>
        <label htmlFor="lng" className={label}>{t("form.lng")}</label>
        <input id="lng" name="lng" type="number" step="any" min={-180} max={180} defaultValue={initial.lng} aria-describedby="lng-hint" className={`${field} mt-1 tabular`} />
        <p id="lng-hint" className={hint}>{t("form.coordsHint")}</p>
        {errors.lng && <p className="mt-1 text-xs text-accent-text">{t(`errors.${errors.lng}`)}</p>}
      </div>
    </fieldset>
  );
}

function YearField({ name, defaultValue, label: text, hint: help, locale, precision, error }: {
  name: string; defaultValue: string; label: string; hint: string; locale: Locale; precision: EventFormValues["precision"]; error: React.ReactNode;
}) {
  const [value, setValue] = useState(defaultValue);
  const n = Number(value);
  const preview = /^-?\d+$/.test(value) && n !== 0 ? formatYear(n, precision, locale) : null;
  return (
    <div>
      <label htmlFor={name} className={label}>{text}</label>
      <input id={name} name={name} type="number" step={1} defaultValue={defaultValue} aria-describedby={`${name}-hint`} onChange={(e) => setValue(e.target.value)} className={`${field} mt-1 font-display tabular`} />
      <p id={`${name}-hint`} className={hint}>{preview ? <strong className="text-secondary">{preview}</strong> : help}</p>
      {error}
    </div>
  );
}

/**
 * No `required` anywhere: three of the four language tabs are hidden at any moment, and a browser
 * cannot report an error on a control it will not scroll to. The server validates instead.
 */
function TextField({ name, defaultValue, rows, label: text, hint: help, softMax, warn, error, onValue }: {
  name: string; defaultValue: string; rows?: number; label: string; hint?: string; softMax?: number; warn?: string; error?: React.ReactNode;
  onValue?: (value: string) => void;
}) {
  const [len, setLen] = useState(defaultValue.length);
  const over = softMax !== undefined && len > softMax;
  const hintId = `${name}-hint`;
  const change = (value: string) => { setLen(value.length); onValue?.(value); };
  return (
    <div>
      <div className="flex justify-between">
        <label htmlFor={name} className={label}>{text}</label>
        {softMax !== undefined && <span aria-hidden className={`text-xs ${over ? "text-accent-text" : "text-muted"}`}>{len}/{softMax}</span>}
      </div>
      {rows ? (
        <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} aria-describedby={hintId} onChange={(e) => change(e.target.value)} className={`${field} mt-1`} />
      ) : (
        <input id={name} name={name} type="text" defaultValue={defaultValue} aria-describedby={hintId} onChange={(e) => change(e.target.value)} className={`${field} mt-1`} />
      )}
      <p id={hintId} className={`mt-1 text-xs ${over && warn ? "text-accent-text" : "text-muted"}`}>{over && warn ? warn : help}</p>
      {error}
    </div>
  );
}

/** Empty = derived from the source-language title on save; the preview shows what that would be. */
function SlugField({ defaultValue, label: text, hint: help, error }: { defaultValue: string; label: string; hint: string; error: React.ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <label htmlFor="slug" className={label}>{text}</label>
      <input id="slug" name="slug" type="text" defaultValue={defaultValue} aria-describedby="slug-hint" onChange={(e) => setValue(e.target.value)} onBlur={(e) => { const s = slugify(e.target.value); e.target.value = s; setValue(s); }} className={`${field} mt-1 font-mono text-sm`} />
      <p id="slug-hint" className={hint}>{value ? `/event/${value}` : help}</p>
      {error}
    </div>
  );
}

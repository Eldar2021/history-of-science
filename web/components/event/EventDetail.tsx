import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/i18n/formatYear";
import { formatYear, formatYearRange } from "@/lib/i18n/formatYear";
import { parseBlocks, parseInline } from "@/lib/content/markdown";
import type { EventDetail as Detail, LinkedEvent } from "@/lib/queries/types";

type Props = {
  event: Detail;
  locale: Locale;
  /** h1 on the full page, h2 inside the panel (the timeline page owns h1 there). */
  headingLevel?: "h1" | "h2";
  /** id for aria-labelledby on the panel dialog. */
  headingId?: string;
};

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) =>
        part.type === "strong" ? <strong key={i}>{part.text}</strong>
        : part.type === "em" ? <em key={i}>{part.text}</em>
        : <span key={i}>{part.text}</span>,
      )}
    </>
  );
}

function LinkedList({ items, locale }: { items: LinkedEvent[]; locale: Locale }) {
  return (
    <ul className="mt-2 space-y-2">
      {items.map((l) => (
        <li key={l.slug} className="rounded-md bg-elevated px-3 py-2">
          <Link href={`/event/${l.slug}`} className="group flex items-baseline gap-3">
            <span className="shrink-0 font-display text-small tabular text-muted">{formatYear(l.year, "exact", locale)}</span>
            <span className="text-body text-primary underline-offset-4 group-hover:underline">{l.title}</span>
          </Link>
          {l.note && <p className="mt-0.5 text-small text-secondary">{l.note}</p>}
        </li>
      ))}
    </ul>
  );
}

/** The event detail (doc/05 "Olay kartı" > tıklama): same component on the full page and inside the panel. */
export async function EventDetail({ event, locale, headingLevel = "h1", headingId }: Props) {
  const [t, tTimeline, tLocales] = await Promise.all([
    getTranslations("event"), getTranslations("timeline"), getTranslations("locales"),
  ]);
  const Heading = headingLevel;
  const year = formatYearRange(event.year, event.year_end, event.precision, locale);
  const blocks = event.body ? parseBlocks(event.body) : [];

  return (
    <article className="text-primary">
      <header>
        {event.era && <p className="font-display text-small text-sage">{event.era.name}</p>}
        <time className="mt-1 block font-display text-year-landmark tabular">{year}</time>
        <Heading id={headingId} className="mt-3 font-display text-2xl leading-tight">{event.title}</Heading>
        <p className="mt-3 text-lg leading-snug text-secondary">{event.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {event.disciplines.map((d) => (
            <span key={d.slug} className="inline-flex items-center gap-1.5 rounded-pill bg-elevated px-2.5 py-1 text-label uppercase tracking-wider text-secondary">
              <span aria-hidden className="h-[7px] w-[7px] rounded-full" style={{ background: `var(--discipline-${d.slug})` }} />
              {d.name}
            </span>
          ))}
          {event.is_fallback && (
            <span className="rounded-pill border border-line px-2.5 py-1 text-label text-muted">
              {tTimeline("notTranslated", { locale: tLocales(locale) })}
            </span>
          )}
          {event.translation_status === "machine" && (
            <span className="rounded-pill border border-line px-2.5 py-1 text-label text-muted">{tTimeline("machineTranslated")}</span>
          )}
        </div>
      </header>

      {event.image_path && (
        <figure className="mt-6">
          {/* Storage images arrive in week 6; until then this is a plain public URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${event.image_path}`}
            alt=""
            className="w-full rounded-image"
            loading="lazy"
          />
          {event.image_credit && (
            <figcaption className="mt-1.5 text-label text-muted">
              {event.image_source_url ? (
                <a href={event.image_source_url} className="underline underline-offset-2" rel="noopener">
                  {t("imageCredit", { credit: event.image_credit, license: event.image_license ?? "" })}
                </a>
              ) : t("imageCredit", { credit: event.image_credit, license: event.image_license ?? "" })}
            </figcaption>
          )}
        </figure>
      )}

      {blocks.length > 0 && (
        <div className="mt-6 space-y-3 text-body text-primary">
          {blocks.map((b, i) =>
            b.type === "heading"
              ? <h3 key={i} className="pt-2 font-display text-title text-primary">{b.text}</h3>
              : <p key={i}><Inline text={b.text} /></p>,
          )}
        </div>
      )}

      {event.why_it_matters && (
        <section className="mt-6 rounded-lg bg-elevated px-4 py-3">
          <h3 className="text-label uppercase tracking-wider text-accent-text">{t("whyItMatters")}</h3>
          <p className="mt-1.5 text-body"><Inline text={event.why_it_matters} /></p>
        </section>
      )}
      {event.if_you_were_there && (
        <section className="mt-3 rounded-lg border border-line px-4 py-3">
          <h3 className="text-label uppercase tracking-wider text-sage">{t("ifYouWereThere")}</h3>
          <p className="mt-1.5 text-body italic text-secondary"><Inline text={event.if_you_were_there} /></p>
        </section>
      )}

      {event.builds_on.length > 0 && (
        <section className="mt-6">
          <h3 className="text-label uppercase tracking-wider text-muted">{t("buildsOn")}</h3>
          <LinkedList items={event.builds_on} locale={locale} />
        </section>
      )}
      {event.enabled.length > 0 && (
        <section className="mt-5">
          <h3 className="text-label uppercase tracking-wider text-muted">{t("enabled")}</h3>
          <LinkedList items={event.enabled} locale={locale} />
        </section>
      )}

      {event.people.length > 0 && (
        <section className="mt-6">
          <h3 className="text-label uppercase tracking-wider text-muted">{t("people")}</h3>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body">
            {event.people.map((p) => (
              <li key={p.slug}>
                <span className="text-primary">{p.name}</span>
                {(p.birth_year || p.death_year) && (
                  <span className="ml-1.5 text-small tabular text-muted">
                    {p.birth_year ? formatYear(p.birth_year, "exact", locale) : "?"}–{p.death_year ? formatYear(p.death_year, "exact", locale) : "?"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {event.sources.length > 0 && (
        <section className="mt-6">
          <h3 className="text-label uppercase tracking-wider text-muted">{t("sources")}</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-small text-secondary">
            {event.sources.map((s, i) => (
              <li key={i}>
                {s.url ? <a href={s.url} className="underline decoration-line underline-offset-4 hover:text-primary" rel="noopener">{s.title}</a> : s.title}
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-8">
        <Link href={`/timeline?year=${event.year}`} className="text-small text-accent-text underline-offset-4 hover:underline">
          {t("showInTimeline")}
        </Link>
      </p>
    </article>
  );
}

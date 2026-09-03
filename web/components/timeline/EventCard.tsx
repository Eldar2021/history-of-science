import type { Locale } from "@/lib/i18n/formatYear";
import { formatYearRange } from "@/lib/i18n/formatYear";
import type { TimelineEvent } from "@/lib/queries/types";

export type CardSize = "landmark" | "standard" | "minor";

/** Importance 5 = landmark (always visible when zoomed out), 3-4 = standard, 1-2 = a one-line note. */
export function cardSize(importance: number): CardSize {
  if (importance >= 5) return "landmark";
  if (importance >= 3) return "standard";
  return "minor";
}

type Labels = { landmark: string; notTranslated: string; machineTranslated: string };

type Props = {
  event: TimelineEvent;
  locale: Locale;
  /** discipline slug -> localized name */
  disciplineNames: Map<string, string>;
  labels: Labels;
};

const DOT: Record<CardSize, string> = {
  landmark: "-left-[2.6rem] top-7 h-3.5 w-3.5 shadow-[0_0_0_3px_var(--bg-base),var(--glow)]",
  standard: "-left-[2.35rem] top-5 h-2.5 w-2.5 shadow-[0_0_0_3px_var(--bg-base)]",
  minor: "-left-[2.1rem] top-1.5 h-1.5 w-1.5 shadow-[0_0_0_3px_var(--bg-base)]",
};

function DisciplineDot({ slug }: { slug: string }) {
  return <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: `var(--discipline-${slug})` }} />;
}

function Badges({ event, locale, labels, disciplineNames, withChips }: Props & { withChips: boolean }) {
  const items: React.ReactNode[] = [];
  if (withChips) {
    for (const d of event.disciplines) {
      items.push(
        <span key={d} className="inline-flex items-center gap-1.5 rounded-pill bg-elevated px-2.5 py-1 text-label uppercase tracking-wider text-secondary">
          <DisciplineDot slug={d} />
          {disciplineNames.get(d) ?? d}
        </span>,
      );
    }
  }
  if (event.is_fallback) {
    items.push(<span key="fallback" className="rounded-pill border border-line px-2.5 py-1 text-label text-muted">{labels.notTranslated}</span>);
  }
  if (event.translation_status === "machine") {
    items.push(<span key="machine" className="rounded-pill border border-line px-2.5 py-1 text-label text-muted">{labels.machineTranslated}</span>);
  }
  void locale;
  if (items.length === 0) return null;
  return <div className="mt-3 flex flex-wrap items-center gap-1.5">{items}</div>;
}

export function EventCard(props: Props) {
  const { event, locale, disciplineNames, labels } = props;
  const size = cardSize(event.importance);
  const year = formatYearRange(event.year, event.year_end, event.precision, locale);
  const primary = event.disciplines[0];
  const dot = <span aria-hidden className={`absolute rounded-full bg-accent ${DOT[size]}`} />;

  if (size === "minor") {
    return (
      <article id={`event-${event.slug}`} className="relative flex flex-wrap items-baseline gap-x-2.5 gap-y-1 py-1">
        {dot}
        <time className="font-display text-year-minor tabular text-secondary">{year}</time>
        <h3 className="text-small text-secondary">{event.title}</h3>
        <Badges {...props} withChips={false} />
      </article>
    );
  }

  if (size === "standard") {
    return (
      <article id={`event-${event.slug}`} className="relative rounded-[24px] bg-elevated px-4 py-4">
        {dot}
        {primary && (
          <p className="flex items-center gap-1.5 text-label uppercase tracking-wider text-muted">
            <DisciplineDot slug={primary} />
            {disciplineNames.get(primary) ?? primary}
          </p>
        )}
        <time className="mt-1.5 block font-display text-year-standard tabular text-primary">{year}</time>
        <h3 className="mt-1.5 font-display text-title text-primary">{event.title}</h3>
        <p className="mt-1.5 text-body text-secondary">{event.summary}</p>
        <Badges {...props} withChips />
      </article>
    );
  }

  return (
    <article id={`event-${event.slug}`} className="relative rounded-card bg-raised px-5 py-5 shadow-lg">
      {dot}
      <p className="flex items-center justify-between gap-3 text-label uppercase tracking-wider text-muted">
        {primary ? (
          <span className="flex items-center gap-1.5">
            <DisciplineDot slug={primary} />
            {disciplineNames.get(primary) ?? primary}
          </span>
        ) : <span />}
        <span className="text-accent-text">{labels.landmark}</span>
      </p>
      <time className="mt-2 block font-display text-year-landmark tabular text-primary">{year}</time>
      <h3 className="mt-2 font-display text-title-lg text-primary">{event.title}</h3>
      <p className="mt-2 text-body text-secondary">{event.summary}</p>
      <Badges {...props} withChips />
    </article>
  );
}

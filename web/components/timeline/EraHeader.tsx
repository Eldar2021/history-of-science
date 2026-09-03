import type { Locale } from "@/lib/i18n/formatYear";
import { formatYear, formatYearRange } from "@/lib/i18n/formatYear";
import type { Era } from "@/lib/queries/types";

/** Sticky era pill. Sits just under the site header (both are 3.5rem tall) and hands over when the next era's section scrolls in. */
export function EraHeader({ era, locale, todayLabel, headingId }: { era: Era; locale: Locale; todayLabel: string; headingId: string }) {
  // Same range rule as events (doc/06): "MÖ 700 - MS 500"; an open era ends at "today".
  const range = era.end_year == null
    ? `${formatYear(era.start_year, "exact", locale)} - ${todayLabel}`
    : formatYearRange(era.start_year, era.end_year, "exact", locale);
  return (
    <div className="sticky top-[3.5rem] z-[5] -mx-4 bg-gradient-to-b from-base from-70% to-transparent px-4 pb-4 pt-2">
      <h2 id={headingId} className="inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-pill bg-elevated px-4 py-2 shadow-sm">
        <span className="font-display text-small text-sage">{era.name}</span>
        <span className="whitespace-nowrap text-label tabular text-muted">{range}</span>
      </h2>
    </div>
  );
}

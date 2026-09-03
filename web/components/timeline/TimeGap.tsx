/** A dotted stretch of the line between two events far apart in time (05-timeline-ux: >50 years, before 1800). */
export function TimeGap({ label }: { label: string }) {
  return (
    <div className="relative py-2">
      <span aria-hidden className="absolute -bottom-5 -left-[1.95rem] top-0 w-0.5 bg-base" />
      <span aria-hidden className="absolute -bottom-5 -left-[1.95rem] top-0 border-l-2 border-dotted border-muted" />
      <p className="text-small tabular text-secondary">{label}</p>
    </div>
  );
}

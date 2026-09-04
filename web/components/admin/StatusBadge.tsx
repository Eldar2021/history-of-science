const TONE: Record<string, string> = {
  draft: "border-line text-secondary",
  review: "border-accent/60 bg-elevated text-accent-text",
  published: "border-sage/60 bg-sage/15 text-primary",
  deleted: "border-line text-muted line-through",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-label uppercase tracking-wider ${TONE[status] ?? TONE.draft}`}>{label}</span>;
}

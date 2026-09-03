"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { matchesFilter as matches, parseSelected } from "@/lib/timeline/filter";

type Chip = { slug: string; name: string };
type Labels = { legend: string; onlyThese: string; clear: string; empty: string };

/**
 * Discipline chips (doc/05 Navigasyon): tap a chip and everything else fades to 0.3 but stays; the
 * "only these" chip hides the rest. State lives in the URL (`d`, `only`) so a shared link opens the
 * same view; `?year=` is preserved. The list is server-rendered, so the filter marks cards through
 * data attributes rather than re-rendering them.
 */
export function DisciplineFilter({ disciplines, eventDisciplines, labels }: { disciplines: Chip[]; eventDisciplines: string[][]; labels: Labels }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const known = new Set(disciplines.map((d) => d.slug));
  const selected = parseSelected(params.get("d"), known);
  const only = params.get("only") === "1" && selected.size > 0;
  const matchCount = eventDisciplines.filter((ds) => matches(selected, ds)).length;

  function navigate(next: Set<string>, nextOnly: boolean) {
    const q = new URLSearchParams(params.toString());
    if (next.size) q.set("d", Array.from(next).join(",")); else q.delete("d");
    if (nextOnly && next.size) q.set("only", "1"); else q.delete("only");
    // Keep the comma readable (doc/05 shows ?d=physics,astronomy); URLSearchParams would encode it.
    const qs = q.toString().replace(/%2C/g, ",");
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function toggle(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    navigate(next, only);
  }

  useEffect(() => {
    const mode = only ? "hide" : "dim";
    for (const li of document.querySelectorAll<HTMLElement>("li[data-disciplines]")) {
      const ok = matches(selected, (li.dataset.disciplines ?? "").split(" ").filter(Boolean));
      if (ok) delete li.dataset.dim; else li.dataset.dim = mode;
    }
    for (const section of document.querySelectorAll<HTMLElement>("section[data-era]")) {
      section.hidden = only && !section.querySelector("li[data-disciplines]:not([data-dim])");
    }
    // `selected` is rebuilt every render; the URL param is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, only]);

  const active = selected.size > 0;
  return (
    <div role="group" aria-label={labels.legend} className="mb-4 flex flex-wrap items-center gap-1.5">
      {disciplines.map((d) => {
        const on = selected.has(d.slug);
        return (
          <button
            key={d.slug}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(d.slug)}
            className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-label uppercase tracking-wider transition-[opacity,box-shadow] duration-(--duration-press) ${
              on ? "bg-elevated text-primary shadow-[inset_0_0_0_1px_var(--accent)]" : "bg-elevated text-secondary hover:text-primary"
            } ${active && !on ? "opacity-60" : ""}`}
          >
            <span aria-hidden className="h-[7px] w-[7px] rounded-full" style={{ background: `var(--discipline-${d.slug})` }} />
            {d.name}
          </button>
        );
      })}
      {active && (
        <>
          <button
            type="button"
            aria-pressed={only}
            onClick={() => navigate(selected, !only)}
            className={`rounded-pill border px-2.5 py-1 text-label uppercase tracking-wider ${only ? "border-accent text-accent-text" : "border-line text-secondary hover:text-primary"}`}
          >
            {labels.onlyThese}
          </button>
          <button type="button" onClick={() => navigate(new Set(), false)} className="px-2 py-1 text-label uppercase tracking-wider text-muted underline-offset-4 hover:underline">
            {labels.clear}
          </button>
        </>
      )}
      {active && matchCount === 0 && (
        <p role="status" className="basis-full pt-2 text-small text-secondary">{labels.empty}</p>
      )}
    </div>
  );
}

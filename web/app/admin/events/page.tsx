import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { requireStaff } from "@/lib/auth";
import { listAdminEvents, SORTS, type ListFilter, type ListSort } from "@/lib/admin/events";
import { formatYear } from "@/lib/i18n/formatYear";
import { locales, type Locale } from "@/i18n/routing";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";

const FILTERS: ListFilter[] = ["all", "draft", "review", "published", "deleted"];

type Props = {
  searchParams: Promise<{ status?: string; deleted?: string; saved?: string; restored?: string; q?: string; missing?: string; sort?: string }>;
};

/** Keeps the search box and the missing-language filter when a status chip or a sort is clicked. */
function href(base: Record<string, string | undefined>, change: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, val] of Object.entries({ ...base, ...change })) if (val) params.set(k, val);
  const q = params.toString();
  return q ? `/admin/events?${q}` : "/admin/events";
}

export default async function AdminEventsPage({ searchParams }: Props) {
  const staff = await requireStaff();
  const { status, deleted, saved, restored, q, missing: rawMissing, sort: rawSort } = await searchParams;
  const filter = (FILTERS.find((f) => f === status) ?? "all") as ListFilter;
  const missing: Locale | undefined = hasLocale(locales, rawMissing) ? rawMissing : undefined;
  const sort = (SORTS.find((s) => s === rawSort) ?? "year") as ListSort;
  const [t, tLocales, events] = await Promise.all([
    getTranslations("admin"),
    getTranslations("locales"),
    listAdminEvents({ filter, q, missing, sort }, staff.uiLocale),
  ]);
  const dateFmt = new Intl.DateTimeFormat(staff.uiLocale, { dateStyle: "medium" });
  const keep = { status: filter === "all" ? undefined : filter, q, missing, sort: sort === "year" ? undefined : sort };

  return (
    <AdminShell
      staff={staff}
      title={t("events.title")}
      actions={
        <Link href="/admin/events/new" className="rounded-pill bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink transition hover:bg-accent-hover">
          {t("events.new")}
        </Link>
      }
    >
      {saved && <p role="status" className="mb-4 rounded-lg border border-sage/60 bg-sage/15 px-4 py-3 text-sm text-primary">{t("events.saved")}</p>}
      {restored && <p role="status" className="mb-4 rounded-lg border border-sage/60 bg-sage/15 px-4 py-3 text-sm text-primary">{t("events.restored")}</p>}
      {deleted && <p role="status" className="mb-4 rounded-lg border border-sage/60 bg-sage/15 px-4 py-3 text-sm text-primary">{t("events.deletedFlash")}</p>}

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        {filter !== "all" && <input type="hidden" name="status" value={filter} />}
        {sort !== "year" && <input type="hidden" name="sort" value={sort} />}
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="q" className="block text-label uppercase tracking-wider text-muted">{t("events.search")}</label>
          <input id="q" name="q" type="search" defaultValue={q ?? ""} placeholder={t("events.searchHint")} className="mt-1 w-full rounded-lg border border-line bg-elevated px-3 py-2 text-primary outline-none transition focus-visible:ring-2 focus-visible:ring-accent" />
        </div>
        <div>
          <label htmlFor="missing" className="block text-label uppercase tracking-wider text-muted">{t("events.missingLabel")}</label>
          <select id="missing" name="missing" defaultValue={missing ?? ""} className="mt-1 rounded-lg border border-line bg-elevated px-3 py-2 text-primary outline-none transition focus-visible:ring-2 focus-visible:ring-accent">
            <option value="">{t("events.missingAny")}</option>
            {locales.map((l) => <option key={l} value={l}>{tLocales(l)}</option>)}
          </select>
        </div>
        <button type="submit" className="rounded-pill border border-line px-4 py-2 text-sm text-secondary transition hover:border-accent hover:text-primary">{t("events.apply")}</button>
        {(q || missing) && (
          <Link href={href(keep, { q: undefined, missing: undefined })} className="pb-2 text-sm text-muted underline underline-offset-4 hover:text-primary">{t("events.clear")}</Link>
        )}
      </form>

      <nav aria-label={t("events.filter")} className="mb-3 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={href(keep, { status: f === "all" ? undefined : f })}
            aria-current={f === filter ? "page" : undefined}
            className="rounded-pill border border-line px-3 py-1 text-secondary transition aria-[current=page]:border-accent aria-[current=page]:bg-elevated aria-[current=page]:text-primary hover:border-accent hover:text-primary"
          >
            {f === "all" ? t("events.filters.all") : t(`events.status.${f}`)}
          </Link>
        ))}
      </nav>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{t("events.count", { count: events.length })}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-label uppercase tracking-wider text-muted">{t("events.sortLabel")}</span>
          {SORTS.map((s) => (
            <Link
              key={s}
              href={href(keep, { sort: s === "year" ? undefined : s })}
              aria-current={s === sort ? "page" : undefined}
              className="rounded-pill border border-line px-3 py-0.5 text-secondary transition aria-[current=page]:border-accent aria-[current=page]:bg-elevated aria-[current=page]:text-primary hover:border-accent hover:text-primary"
            >
              {t(`events.sort.${s}`)}
            </Link>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <p className="rounded-lg border border-line bg-elevated/40 p-6 text-secondary">{t("events.empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="bg-elevated text-left text-label uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2.5">{t("events.columns.year")}</th>
                <th className="px-3 py-2.5">{t("events.columns.title")}</th>
                <th className="px-3 py-2.5">{t("events.columns.status")}</th>
                <th className="px-3 py-2.5">{t("events.columns.author")}</th>
                <th className="px-3 py-2.5">{t("events.columns.languages")}</th>
                <th className="px-3 py-2.5">{t("events.columns.updated")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-line transition hover:bg-raised">
                  <td className="whitespace-nowrap px-3 py-2.5 font-display tabular text-primary">
                    {formatYear(e.year, e.precision, staff.uiLocale)}
                    {e.year_end !== null && ` – ${formatYear(e.year_end, e.precision, staff.uiLocale)}`}
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/events/${e.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{e.title}</Link>
                    <span className="ml-2 font-mono text-xs text-muted">{e.slug}</span>
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge status={e.deleted_at ? "deleted" : e.status} label={t(`events.status.${e.deleted_at ? "deleted" : e.status}`)} /></td>
                  <td className="px-3 py-2.5 text-secondary">{t(`events.author.${e.drafted_by}`)}</td>
                  <td className="px-3 py-2.5">
                    <ul className="flex gap-1.5" aria-label={t("events.columns.languages")}>
                      {locales.map((l) => {
                        const st = e.languages[l];
                        const title = st ? `${l}: ${t(`events.translation.${st}`)}` : `${l}: ${t("events.translation.missing")}`;
                        return (
                          <li
                            key={l}
                            title={title}
                            aria-label={title}
                            className={`rounded px-1.5 py-0.5 text-xs uppercase ${st ? (st === "machine" ? "bg-elevated text-accent-text" : "bg-sage/20 text-primary") : "text-muted line-through"}`}
                          >
                            {l}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted">{dateFmt.format(new Date(e.updated_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

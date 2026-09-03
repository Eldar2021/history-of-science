import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { listAdminEvents, type ListFilter } from "@/lib/admin/events";
import { formatYear } from "@/lib/i18n/formatYear";
import { locales } from "@/i18n/routing";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";

const FILTERS: ListFilter[] = ["all", "draft", "review", "published", "deleted"];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminEventsPage({ searchParams }: Props) {
  const staff = await requireStaff();
  const { status } = await searchParams;
  const filter = (FILTERS.find((f) => f === status) ?? "all") as ListFilter;
  const [t, events] = await Promise.all([getTranslations("admin"), listAdminEvents(filter, staff.uiLocale)]);
  const dateFmt = new Intl.DateTimeFormat(staff.uiLocale, { dateStyle: "medium" });

  return (
    <AdminShell
      staff={staff}
      title={t("events.title")}
      actions={
        <Link href="/admin/events/new" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink hover:bg-accent-hover">
          {t("events.new")}
        </Link>
      }
    >
      <nav aria-label={t("events.filter")} className="mb-4 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/events" : `/admin/events?status=${f}`}
            aria-current={f === filter ? "page" : undefined}
            className="rounded-full border border-line px-3 py-1 text-secondary aria-[current=page]:border-accent aria-[current=page]:bg-elevated aria-[current=page]:text-primary hover:text-primary"
          >
            {f === "all" ? t("events.filters.all") : t(`events.status.${f}`)}
          </Link>
        ))}
      </nav>

      <p className="mb-2 text-sm text-muted">{t("events.count", { count: events.length })}</p>
      {events.length === 0 ? (
        <p className="rounded-md border border-line bg-raised p-6 text-secondary">{t("events.empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full text-sm">
            <thead className="bg-elevated text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2">{t("events.columns.year")}</th>
                <th className="px-3 py-2">{t("events.columns.title")}</th>
                <th className="px-3 py-2">{t("events.columns.status")}</th>
                <th className="px-3 py-2">{t("events.columns.author")}</th>
                <th className="px-3 py-2">{t("events.columns.languages")}</th>
                <th className="px-3 py-2">{t("events.columns.updated")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-line hover:bg-raised">
                  <td className="whitespace-nowrap px-3 py-2 font-display tabular text-primary">
                    {formatYear(e.year, e.precision, staff.uiLocale)}
                    {e.year_end !== null && ` – ${formatYear(e.year_end, e.precision, staff.uiLocale)}`}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/events/${e.id}`} className="font-medium text-primary hover:underline">{e.title}</Link>
                    <span className="ml-2 text-xs text-muted">{e.slug}</span>
                  </td>
                  <td className="px-3 py-2"><StatusBadge status={e.deleted_at ? "deleted" : e.status} label={t(`events.status.${e.deleted_at ? "deleted" : e.status}`)} /></td>
                  <td className="px-3 py-2 text-secondary">{t(`events.author.${e.drafted_by}`)}</td>
                  <td className="px-3 py-2">
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
                  <td className="whitespace-nowrap px-3 py-2 text-muted">{dateFmt.format(new Date(e.updated_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

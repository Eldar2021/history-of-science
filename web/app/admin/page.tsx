import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/routing";
import { requireStaff } from "@/lib/auth";
import { getAdminStats } from "@/lib/admin/events";
import { STATUSES } from "@/lib/admin/eventForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";

/** Where the day starts: what is unfinished, which language is behind, what was touched last. */
export default async function AdminHome() {
  const staff = await requireStaff();
  const [t, tLocales, stats] = await Promise.all([
    getTranslations("admin"),
    getTranslations("locales"),
    getAdminStats(staff.uiLocale),
  ]);
  const dateFmt = new Intl.DateTimeFormat(staff.uiLocale, { dateStyle: "medium", timeStyle: "short" });
  const total = STATUSES.reduce((n, s) => n + stats.byStatus[s], 0);

  return (
    <AdminShell
      staff={staff}
      title={t("nav.dashboard")}
      actions={
        <Link href="/admin/events/new" className="rounded-pill bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink transition hover:bg-accent-hover">
          {t("events.new")}
        </Link>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/events?status=${s}`} className="rounded-lg border border-line bg-elevated/40 p-4 transition hover:border-accent">
            <p className="text-label uppercase tracking-wider text-muted">{t(`events.status.${s}`)}</p>
            <p className="mt-1 font-display text-year-standard tabular text-primary">{stats.byStatus[s]}</p>
          </Link>
        ))}
        <Link href="/admin/events?status=deleted" className="rounded-lg border border-line bg-elevated/40 p-4 transition hover:border-accent">
          <p className="text-label uppercase tracking-wider text-muted">{t("events.status.deleted")}</p>
          <p className="mt-1 font-display text-year-standard tabular text-muted">{stats.deleted}</p>
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="text-label uppercase tracking-wider text-muted">{t("dashboard.missing")}</h2>
        <p className="mt-1 text-sm text-muted">{t("dashboard.missingHint", { total })}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {locales.map((l) => (
            <li key={l}>
              <Link
                href={`/admin/events?missing=${l}`}
                className={`inline-flex items-baseline gap-2 rounded-pill border px-4 py-1.5 transition hover:border-accent ${stats.missing[l] ? "border-accent/50 text-primary" : "border-line text-muted"}`}
              >
                <span>{tLocales(l)}</span>
                <span className="font-display tabular">{stats.missing[l]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-label uppercase tracking-wider text-muted">{t("dashboard.recent")}</h2>
        {stats.recent.length === 0 ? (
          <p className="mt-3 rounded-lg border border-line bg-elevated/40 p-6 text-secondary">{t("events.empty")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line">
            {stats.recent.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/events/${e.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition hover:bg-raised">
                  <span className="text-primary">{e.title}</span>
                  <span className="flex items-center gap-3">
                    <StatusBadge status={e.status} label={t(`events.status.${e.status}`)} />
                    <span className="text-xs text-muted">{dateFmt.format(new Date(e.updated_at))}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-sm text-muted">{t("signedInAs", { email: staff.email ?? staff.id, role: t(`roles.${staff.role}`) })}</p>
    </AdminShell>
  );
}

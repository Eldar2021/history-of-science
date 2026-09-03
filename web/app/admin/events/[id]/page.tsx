import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { locales, type Locale } from "@/i18n/routing";
import { requireStaff } from "@/lib/auth";
import { getAdminEvent, toFormValues } from "@/lib/admin/events";
import { getDisciplines } from "@/lib/queries/timeline";
import { formatYear } from "@/lib/i18n/formatYear";
import { AdminShell } from "@/components/admin/AdminShell";
import { EventForm } from "@/components/admin/EventForm";
import { StatusBadge } from "@/components/admin/StatusBadge";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; locale?: string }> };

export default async function EditEventPage({ params, searchParams }: Props) {
  const staff = await requireStaff();
  const [{ id }, { saved, locale: rawLocale }] = await Promise.all([params, searchParams]);
  const [t, tLocales, event, disciplines] = await Promise.all([
    getTranslations("admin"),
    getTranslations("locales"),
    getAdminEvent(id),
    getDisciplines(staff.uiLocale),
  ]);
  if (!event) notFound();
  const editLocale: Locale = hasLocale(locales, rawLocale) ? rawLocale : event.row.source_locale;
  const initial = toFormValues(event, editLocale);
  const status = event.row.deleted_at ? "deleted" : event.row.status;
  const publicPath = `/${editLocale}/event/${event.row.slug}`;

  return (
    <AdminShell
      staff={staff}
      title={`${formatYear(event.row.year, event.row.precision, staff.uiLocale)} · ${initial.title || event.row.slug}`}
      actions={
        <>
          <StatusBadge status={status} label={t(`events.status.${status}`)} />
          {event.row.status === "published" && !event.row.deleted_at && (
            <Link href={publicPath} className="text-sm text-secondary underline hover:text-primary" target="_blank" rel="noreferrer">
              {t("events.viewOnSite")}
            </Link>
          )}
        </>
      }
    >
      {saved && (
        <p role="status" className="mb-4 rounded-md border border-sage/60 bg-sage/15 px-3 py-2 text-sm text-primary">{t("events.saved")}</p>
      )}
      <nav aria-label={t("events.form.editLocale")} className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">{t("events.form.editLocale")}:</span>
        {locales.map((l) => {
          const exists = Boolean(event.translations[l]);
          return (
            <Link
              key={l}
              href={`/admin/events/${id}?locale=${l}`}
              aria-current={l === editLocale ? "page" : undefined}
              className={`rounded-full border border-line px-3 py-1 aria-[current=page]:border-accent aria-[current=page]:bg-elevated aria-[current=page]:text-primary ${exists ? "text-secondary" : "text-muted"}`}
            >
              {tLocales(l)}{!exists && " ∅"}
            </Link>
          );
        })}
      </nav>
      <EventForm key={editLocale} initial={initial} disciplines={disciplines} uiLocale={staff.uiLocale} />
    </AdminShell>
  );
}

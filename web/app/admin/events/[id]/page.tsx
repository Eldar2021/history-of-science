import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { locales, type Locale } from "@/i18n/routing";
import { requireStaff } from "@/lib/auth";
import { getAdminEvent, listEventOptions, toFormValues } from "@/lib/admin/events";
import { getDisciplines } from "@/lib/queries/timeline";
import { formatYear } from "@/lib/i18n/formatYear";
import { AdminShell } from "@/components/admin/AdminShell";
import { EventForm } from "@/components/admin/EventForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteEvent, restoreEvent } from "../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; restored?: string; error?: string; locale?: string }> };

export default async function EditEventPage({ params, searchParams }: Props) {
  const staff = await requireStaff();
  const [{ id }, { saved, restored, error, locale: rawLocale }] = await Promise.all([params, searchParams]);
  const [t, event, disciplines, eventOptions] = await Promise.all([
    getTranslations("admin"),
    getAdminEvent(id),
    getDisciplines(staff.uiLocale),
    listEventOptions(staff.uiLocale),
  ]);
  if (!event) notFound();
  // The form holds every language; this only says which tab opens first.
  const openLocale: Locale = hasLocale(locales, rawLocale) ? rawLocale : event.row.source_locale;
  const initial = toFormValues(event, openLocale);
  const status = event.row.deleted_at ? "deleted" : event.row.status;
  const title = initial.translations[event.row.source_locale].title || event.row.slug;
  const publicPath = `/${openLocale}/event/${event.row.slug}`;

  return (
    <AdminShell
      staff={staff}
      title={`${formatYear(event.row.year, event.row.precision, staff.uiLocale)} · ${title}`}
      actions={
        <>
          <StatusBadge status={status} label={t(`events.status.${status}`)} />
          {event.row.status === "published" && !event.row.deleted_at && (
            <Link href={publicPath} className="rounded-pill border border-line px-3 py-1 text-sm text-secondary transition hover:border-accent hover:text-primary" target="_blank" rel="noreferrer">
              {t("events.viewOnSite")}
            </Link>
          )}
        </>
      }
    >
      {(saved || restored) && (
        <p role="status" className="mb-6 rounded-lg border border-sage/60 bg-sage/15 px-4 py-3 text-sm text-primary">{t(saved ? "events.saved" : "events.restored")}</p>
      )}
      {error && (
        <p role="alert" className="mb-6 rounded-lg border border-accent/40 bg-elevated px-4 py-3 text-sm text-accent-text">{t("events.errors.saveFailed")}</p>
      )}
      {event.row.deleted_at && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/40 bg-elevated px-4 py-3 text-sm">
          <span className="text-accent-text">{t("events.deletedOn", { date: new Intl.DateTimeFormat(staff.uiLocale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.row.deleted_at)) })}</span>
          <form action={restoreEvent}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="rounded-pill bg-accent px-4 py-1.5 font-medium text-accent-ink transition hover:bg-accent-hover">{t("events.restore")}</button>
          </form>
        </div>
      )}

      <EventForm initial={initial} disciplines={disciplines} uiLocale={staff.uiLocale} eventOptions={eventOptions} />

      {!event.row.deleted_at && (
        <form action={deleteEvent} className="mt-12 border-t border-line pt-6">
          <input type="hidden" name="id" value={id} />
          <ConfirmButton message={t("events.deleteConfirm", { title })} className="text-sm text-secondary underline underline-offset-4 transition hover:text-accent-text">
            {t("events.delete")}
          </ConfirmButton>
          <p className="mt-1 text-xs text-muted">{t("events.deleteHint")}</p>
        </form>
      )}
    </AdminShell>
  );
}

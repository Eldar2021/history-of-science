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
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteEvent, restoreEvent } from "../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; restored?: string; error?: string; locale?: string }> };

export default async function EditEventPage({ params, searchParams }: Props) {
  const staff = await requireStaff();
  const [{ id }, { saved, restored, error, locale: rawLocale }] = await Promise.all([params, searchParams]);
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
      {(saved || restored) && (
        <p role="status" className="mb-4 rounded-md border border-sage/60 bg-sage/15 px-3 py-2 text-sm text-primary">{t(saved ? "events.saved" : "events.restored")}</p>
      )}
      {error && (
        <p role="alert" className="mb-4 rounded-md border border-accent/40 bg-elevated px-3 py-2 text-sm text-accent-text">{t("events.errors.saveFailed")}</p>
      )}
      {event.row.deleted_at && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent/40 bg-elevated px-3 py-2 text-sm">
          <span className="text-accent-text">{t("events.deletedOn", { date: new Intl.DateTimeFormat(staff.uiLocale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.row.deleted_at)) })}</span>
          <form action={restoreEvent}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="rounded-md bg-accent px-3 py-1 font-medium text-accent-ink hover:bg-accent-hover">{t("events.restore")}</button>
          </form>
        </div>
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
      {!event.row.deleted_at && (
        <form action={deleteEvent} className="mt-12 border-t border-line pt-6">
          <input type="hidden" name="id" value={id} />
          <ConfirmButton message={t("events.deleteConfirm", { title: initial.title || event.row.slug })} className="text-sm text-secondary underline hover:text-accent-text">
            {t("events.delete")}
          </ConfirmButton>
          <p className="mt-1 text-xs text-muted">{t("events.deleteHint")}</p>
        </form>
      )}
    </AdminShell>
  );
}

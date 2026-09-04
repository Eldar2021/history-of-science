import { getTranslations } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { emptyEventForm } from "@/lib/admin/eventForm";
import { listEventOptions } from "@/lib/admin/events";
import { getDisciplines } from "@/lib/queries/timeline";
import { AdminShell } from "@/components/admin/AdminShell";
import { EventForm } from "@/components/admin/EventForm";

export default async function NewEventPage() {
  const staff = await requireStaff();
  const [t, disciplines, eventOptions] = await Promise.all([
    getTranslations("admin"),
    getDisciplines(staff.uiLocale),
    listEventOptions(staff.uiLocale),
  ]);
  return (
    <AdminShell staff={staff} title={t("events.new")}>
      <EventForm initial={emptyEventForm(staff.uiLocale)} disciplines={disciplines} uiLocale={staff.uiLocale} eventOptions={eventOptions} />
    </AdminShell>
  );
}

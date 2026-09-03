import { getTranslations } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { emptyEventForm } from "@/lib/admin/eventForm";
import { getDisciplines } from "@/lib/queries/timeline";
import { AdminShell } from "@/components/admin/AdminShell";
import { EventForm } from "@/components/admin/EventForm";

export default async function NewEventPage() {
  const staff = await requireStaff();
  const [t, disciplines] = await Promise.all([getTranslations("admin"), getDisciplines(staff.uiLocale)]);
  return (
    <AdminShell staff={staff} title={t("events.new")}>
      <EventForm initial={emptyEventForm(staff.uiLocale)} disciplines={disciplines} uiLocale={staff.uiLocale} />
    </AdminShell>
  );
}

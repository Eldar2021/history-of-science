import { getTranslations } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminHome() {
  const staff = await requireStaff();
  const t = await getTranslations("admin");
  return (
    <AdminShell staff={staff} title={t("nav.dashboard")}>
      <p className="text-secondary">{t("signedInAs", { email: staff.email ?? staff.id, role: t(`roles.${staff.role}`) })}</p>
    </AdminShell>
  );
}

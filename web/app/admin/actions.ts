"use server";

import { revalidatePath } from "next/cache";
import { hasLocale } from "next-intl";
import { locales } from "@/i18n/routing";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Admin UI language lives in profiles.ui_locale (ADR-018, doc/i18n.md). */
export async function setUiLocale(formData: FormData) {
  const staff = await requireStaff();
  const locale = String(formData.get("locale") ?? "");
  if (!hasLocale(locales, locale)) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ ui_locale: locale }).eq("id", staff.id);
  revalidatePath("/admin", "layout");
}

import { cache } from "react";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/supabase/session";

export type Staff = { id: string; email: string | null; role: StaffRole; uiLocale: Locale };

/** Signed-in staff member (admin/editor) for the current request, or null. Cached per request. */
export const getStaff = cache(async (): Promise<Staff | null> => {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role, ui_locale").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "editor") return null;
  return { id: user.id, email: user.email ?? null, role: profile.role, uiLocale: profile.ui_locale as Locale };
});

/** Second lock behind the proxy: server components and actions call this before touching content. */
export async function requireStaff(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}

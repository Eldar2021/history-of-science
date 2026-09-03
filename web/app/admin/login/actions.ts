"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Only same-origin admin paths are valid return targets; anything else goes to the dashboard. */
function safeNext(value: FormDataEntryValue | null): string {
  return typeof value === "string" && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  if (!email || !password) redirect(`/admin/login?error=invalid&next=${encodeURIComponent(next)}`);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/admin/login?error=invalid&next=${encodeURIComponent(next)}`);
  // The proxy decides on the next request whether the account has a staff role.
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

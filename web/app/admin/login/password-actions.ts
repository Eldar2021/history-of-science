"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { absolute } from "@/lib/site";

/**
 * Ask Supabase for a reset email. The answer is the same whether or not the address exists: telling a
 * stranger which addresses are staff accounts is not information we owe them.
 */
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/admin/forgot-password?error=invalid");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: absolute("/api/auth/callback") });
  redirect("/admin/forgot-password?sent=1");
}

/** Set a new password for whoever the recovery link signed in. */
export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) redirect("/admin/reset-password?error=tooShort");
  if (password !== confirm) redirect("/admin/reset-password?error=mismatch");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?error=linkExpired");

  const { error } = await supabase.auth.updateUser({ password });
  // Supabase refuses a password identical to the current one; that deserves its own sentence.
  if (error) redirect(`/admin/reset-password?error=${error.code === "same_password" ? "samePassword" : "failed"}`);
  redirect("/admin?passwordChanged=1");
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where a password-reset email lands. Supabase sends a one-time code; trading it for a session is a
 * cookie write, which only a route handler or a server action may do - hence a route, and hence
 * under /api, which the proxy leaves alone (an anonymous visitor must be able to reach it).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/reset-password";

  if (!code) return NextResponse.redirect(new URL("/admin/login?error=linkExpired", origin), 302);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/admin/login?error=linkExpired", origin), 302);

  // Same-origin admin paths only, so a crafted link cannot bounce anyone off the site.
  const target = next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  return NextResponse.redirect(new URL(target, origin), 302);
}

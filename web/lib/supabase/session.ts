import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

export type StaffRole = "admin" | "editor";

export type SessionResult = {
  /** Response carrying any refreshed auth cookies. Return it (or copy its cookies) so the session stays alive. */
  response: NextResponse;
  user: { id: string; email: string | null } | null;
  /** Role from `profiles`; null when signed out or when the account is a plain viewer. */
  role: StaffRole | null;
};

/**
 * Refreshes the Supabase session from the request cookies (proxy/middleware side of @supabase/ssr)
 * and resolves the signed-in user's staff role. RLS lets a user read only their own profile row.
 */
export async function refreshSession(request: NextRequest): Promise<SessionResult> {
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // getUser() validates the token against Auth; never trust getSession() here.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response, user: null, role: null };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role === "admin" || profile?.role === "editor" ? profile.role : null;
  return { response, user: { id: user.id, email: user.email ?? null }, role };
}

/** Redirect that keeps the refreshed auth cookies from `from`. */
export function redirectWithCookies(url: URL, from: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url, 302); // 302 (not 307): a POST to a protected page must not be replayed against the login page
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { refreshSession, redirectWithCookies } from "./lib/supabase/session";

const handleI18n = createMiddleware(routing);

const ADMIN_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login";

function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Admin gate (first lock; RLS is the second): every /admin request refreshes the Supabase session.
 * Anonymous → 302 to /admin/login?next=…; signed in without a staff role → login with an error.
 * The login page itself only bounces already-signed-in staff to the dashboard.
 */
async function handleAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === LOGIN_PATH;
  if (!hasSupabaseEnv()) {
    if (isLogin) return NextResponse.next();
    return NextResponse.redirect(new URL(`${LOGIN_PATH}?error=noEnv`, request.url), 302);
  }

  const { response, user, role } = await refreshSession(request);
  if (isLogin) {
    if (user && role) return redirectWithCookies(new URL(ADMIN_PREFIX, request.url), response);
    return response;
  }
  if (!user) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("next", pathname + search);
    return redirectWithCookies(url, response);
  }
  if (!role) return redirectWithCookies(new URL(`${LOGIN_PATH}?error=forbidden`, request.url), response);
  return response;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) return handleAdmin(request);
  return handleI18n(request);
}

export const config = {
  // Public site (locale detection + prefix) and the admin area; skips API, Next internals and files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";
import type { Database } from "./types";

/** Server-side Supabase client bound to the request cookies (RLS applies as the signed-in user). */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabaseEnv();
  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component: cookies are read-only there. The proxy refreshes sessions.
          }
        },
      },
    },
  );
}

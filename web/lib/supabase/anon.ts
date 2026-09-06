import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Cookie-less client with the anon key: exactly what a visitor's browser would get, so RLS is
 * the only filter (drafts never appear). Public reads use it so they can live inside the data
 * cache (`unstable_cache` forbids cookies()) and static pages stay static.
 */
export function createAnonClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createSupabaseClient<Database>(
    url,
    anonKey,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cookie-less client with the anon key: exactly what a visitor's browser would get, so RLS is
 * the only filter (drafts never appear). Public reads use it so they can live inside the data
 * cache (`unstable_cache` forbids cookies()) and static pages stay static.
 */
export function createAnonClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}

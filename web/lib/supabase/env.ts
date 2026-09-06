/**
 * The two public variables every visitor read needs. A missing one is a deployment mistake, not a
 * mode the site runs in (ADR-037): reads throw here rather than serving something invented, so a
 * build without them fails instead of publishing pages that look real.
 */
const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_VAR = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export type SupabaseEnv = { url: string; anonKey: string };
type EnvSource = { NEXT_PUBLIC_SUPABASE_URL?: string; NEXT_PUBLIC_SUPABASE_ANON_KEY?: string };

// Read literally, never through a computed key: Next only inlines NEXT_PUBLIC_* it can see written out.
const currentEnv = (): EnvSource => ({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

/** True when both variables are set. For the few places that may legitimately carry on without them. */
export function hasSupabaseEnv(env: EnvSource = currentEnv()): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Both variables, or an error that names the ones missing. */
export function requireSupabaseEnv(env: EnvSource = currentEnv()): SupabaseEnv {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) return { url, anonKey };
  const missing = [url ? null : URL_VAR, anonKey ? null : KEY_VAR].filter(Boolean).join(" and ");
  throw new Error(`Supabase is not configured: ${missing} missing. The site has no content without it.`);
}

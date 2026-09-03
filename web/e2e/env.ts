import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Local Supabase settings from web/.env.local (or the environment, e.g. CI). */
export function loadEnv() {
  try {
    for (const line of readFileSync(resolve(__dirname, "../.env.local"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    // no .env.local: rely on the environment
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for e2e");
  return { url: url.replace(/\/$/, ""), serviceKey };
}

export const ADMIN = { email: "e2e-admin@uchkun.local", password: "uchkun-e2e-admin" };

/** Service-role REST call: test setup and cleanup only, never from app code. */
export async function serviceFetch(path: string, init?: RequestInit) {
  const { url, serviceKey } = loadEnv();
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} → ${res.status}: ${await res.text()}`);
  return res;
}

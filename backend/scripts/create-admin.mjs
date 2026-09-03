#!/usr/bin/env node
// Creates (or reuses) an Auth user and gives it the `admin` role. Local dev and Playwright setup.
// Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (web/.env.local has the local demo values).
//   node backend/scripts/create-admin.mjs admin@uchkun.local 'password' [role]
// Cloud: same script with the cloud URL + service key, or Supabase panel → Authentication → Add user,
// then `update profiles set role='admin' where id='<uuid>'`.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const [email, password, role = "admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error("usage: create-admin.mjs <email> <password> [admin|editor]");
  process.exit(2);
}

function loadEnv() {
  const p = resolve(import.meta.dirname, "../../web/.env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();
const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(2);
}
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

async function api(path, init) {
  const res = await fetch(`${url}${path}`, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} → ${res.status}: ${text}`);
  return body;
}

// 1. find or create the auth user
let user = null;
const list = await api(`/auth/v1/admin/users?page=1&per_page=1000`);
user = (list.users ?? []).find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
if (user) {
  await api(`/auth/v1/admin/users/${user.id}`, { method: "PUT", body: JSON.stringify({ password, email_confirm: true }) });
  console.log(`user exists: ${user.id} (password reset)`);
} else {
  user = await api(`/auth/v1/admin/users`, {
    method: "POST",
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  console.log(`user created: ${user.id}`);
}

// 2. role (the on_auth_user_created trigger inserted a viewer row)
await api(`/rest/v1/profiles?id=eq.${user.id}`, {
  method: "PATCH",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify({ role }),
});
const [profile] = await api(`/rest/v1/profiles?id=eq.${user.id}&select=id,role,ui_locale`);
console.log(`profile: role=${profile.role} ui_locale=${profile.ui_locale}`);

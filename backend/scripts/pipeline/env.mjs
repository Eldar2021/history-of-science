/**
 * Where the pipeline gets its database credentials. Two shapes, on purpose:
 *
 *   - a run in CI has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment (cloud Supabase);
 *   - a run on this machine reads backend/.env.pipeline (cloud, gitignored) if it exists, and falls
 *     back to web/.env.local, which is the local Supabase.
 *
 * In that order, so writing content from the laptop into the real review queue is a matter of having
 * one gitignored file, and a machine without it can only ever touch its own database.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Parse a .env file loosely: KEY=value, ignoring comments, blanks and surrounding quotes. */
function readEnvFile(path) {
  const out = {};
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of text.split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

export function supabaseCredentials() {
  const file = {
    ...readEnvFile(join(repoRoot, "web", ".env.local")),
    ...readEnvFile(join(repoRoot, "backend", ".env.pipeline")),
  };
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    file.SUPABASE_URL ||
    file.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || file.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "No Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment, or\n" +
        "in backend/.env.pipeline (cloud, see doc/mimari.md), or start the local Supabase so that\n" +
        "web/.env.local applies.",
    );
  }
  return { url: url.replace(/\/$/, ""), key, isLocal: /127\.0\.0\.1|localhost/.test(url) };
}

/** A PostgREST read as the service role. Reads only: nothing in the pipeline writes over HTTP. */
export async function selectRows(path) {
  const { url, key } = supabaseCredentials();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${path}: ${await res.text()}`);
  return res.json();
}

export { repoRoot };

#!/usr/bin/env node
/**
 * Fills PUBLISHED events that only have a summary ("stubs": the seed rows) from drafts in
 * backend/content/drafts. Human-triggered complement of drafts-to-sql.mjs, which never touches a
 * published row. Usage:
 *   node backend/scripts/fill-stubs-sql.mjs [dir] [slug ...] | psql ...      (local)
 *   node backend/scripts/fill-stubs-sql.mjs > /tmp/fill.sql && cd backend && supabase db query --linked --file /tmp/fill.sql
 *
 * Guards: only the source-locale translation of a published, not deleted event whose body is still
 * empty is written (title/summary/body/why/if_you_were_there). Sources are added only when the event
 * has none. Links are inserted with "on conflict do nothing". Status, year and importance are never
 * changed. Running it twice is a no-op.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [dirArg, ...only] = process.argv.slice(2);
const dir = dirArg && !dirArg.endsWith(".json") && readdirSync(dirArg) ? dirArg : "backend/content/drafts";
const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const stub = (slug) => `(select e.id from events e join event_translations t on t.event_id = e.id and t.locale = e.source_locale
  where e.slug = ${q(slug)} and e.status = 'published' and e.deleted_at is null and coalesce(t.body, '') = '')`;

let drafts = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
if (only.length) drafts = drafts.filter((d) => only.includes(d.slug));
const out = ["begin;"];

for (const d of drafts) {
  const pending = [...d.builds_on, ...d.enables].filter((s) => s.endsWith("?"));
  const note = [
    d.verify_note_tr,
    d.people?.length ? `People: ${d.people.map((p) => `${p.name} (${p.role})`).join("; ")}` : "",
    pending.length ? `Pending links (targets not written yet): ${pending.join(", ")}` : "",
  ].filter(Boolean).join("\n\n");

  // Order matters: research_note and sources are gated on "body still empty", so they go before the text.
  const sourceRows = d.sources.map((src) => `(${q(src.title)}, ${q(src.url)}, ${q(src.kind)})`).join(",\n    ");
  out.push(`
-- ${d.slug}: only while the published body is empty
update events set research_note = ${q(note)} where id = ${stub(d.slug)};
insert into sources (event_id, title, url, kind)
  select s.id, v.title, v.url, v.kind from (select ${stub(d.slug)} as id) s, (values
    ${sourceRows}) as v(title, url, kind)
  where s.id is not null and not exists (select 1 from sources x where x.event_id = s.id);
with s as (select ${stub(d.slug)} as id)
update event_translations t set title = ${q(d.title)}, summary = ${q(d.summary)}, body = ${q(d.body)},
  why_it_matters = ${q(d.why_it_matters)}, if_you_were_there = ${q(d.if_you_were_there)}
from s, events e where t.event_id = s.id and e.id = s.id and t.locale = e.source_locale;`);
}
for (const d of drafts) {
  for (const t of d.builds_on.filter((s) => !s.endsWith("?"))) {
    out.push(`insert into event_links (from_event_id, to_event_id, type) select a.id, b.id, 'builds_on' from events a, events b where a.slug = ${q(d.slug)} and b.slug = ${q(t)} on conflict do nothing;`);
  }
  for (const t of d.enables.filter((s) => !s.endsWith("?"))) {
    out.push(`insert into event_links (from_event_id, to_event_id, type) select a.id, b.id, 'builds_on' from events a, events b where a.slug = ${q(t)} and b.slug = ${q(d.slug)} on conflict do nothing;`);
  }
}
out.push("commit;");
process.stdout.write(out.join("\n") + "\n");

#!/usr/bin/env node
/**
 * Turn backend/content/drafts/*.json into idempotent SQL for the local database.
 * Usage: node backend/scripts/drafts-to-sql.mjs [dir] | docker exec -i supabase_db_uchkun psql -U postgres -d postgres -v ON_ERROR_STOP=1
 *
 * Writes events as status='draft' only (ADR-014: publishing is a human action). Every statement is
 * guarded by status='draft', so a draft that shares a slug with a published event changes nothing
 * (not even its translation, disciplines, sources or links). Links whose target does not exist yet
 * (slugs ending in "?") are kept in research_note instead of event_links.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? "backend/content/drafts";
const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (xs) => `array[${xs.map(q).join(",")}]::text[]`;
/** id of the event only while it is still a draft; null (no rows) once published. */
const draftId = (slug) => `(select id from events where slug = ${q(slug)} and status = 'draft')`;

const drafts = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
const out = ["begin;"];

for (const d of drafts) {
  if (d.status !== "draft") throw new Error(`${d.slug}: only status=draft may be loaded by this script`);
  const pending = [...d.builds_on, ...d.enables].filter((s) => s.endsWith("?"));
  const note = [
    d.verify_note_tr,
    d.people?.length ? `People: ${d.people.map((p) => `${p.name} (${p.role})`).join("; ")}` : "",
    pending.length ? `Pending links (targets not written yet): ${pending.join(", ")}` : "",
  ].filter(Boolean).join("\n\n");

  out.push(`
insert into events (slug, year, year_end, precision, importance, status, drafted_by, source_locale, research_note)
values (${q(d.slug)}, ${d.year}, ${d.year_end ?? "null"}, ${q(d.precision)}, ${d.importance}, 'draft', 'ai', ${q(d.source_locale ?? "en")}, ${q(note)})
on conflict (slug) do update set year = excluded.year, year_end = excluded.year_end, precision = excluded.precision,
  importance = excluded.importance, drafted_by = excluded.drafted_by, research_note = excluded.research_note
  where events.status = 'draft';

insert into event_translations (event_id, locale, title, summary, body, why_it_matters, if_you_were_there, status)
select id, ${q(d.source_locale ?? "en")}, ${q(d.title)}, ${q(d.summary)}, ${q(d.body)}, ${q(d.why_it_matters)}, ${q(d.if_you_were_there)}, 'human'
from events where slug = ${q(d.slug)} and status = 'draft'
on conflict (event_id, locale) do update set title = excluded.title, summary = excluded.summary, body = excluded.body,
  why_it_matters = excluded.why_it_matters, if_you_were_there = excluded.if_you_were_there;

delete from event_disciplines where event_id = ${draftId(d.slug)};
insert into event_disciplines (event_id, discipline_id, is_primary)
select e.id, di.id, di.slug = ${q(d.disciplines[0])} from events e, disciplines di
where e.slug = ${q(d.slug)} and e.status = 'draft' and di.slug = any (${arr(d.disciplines)});

delete from sources where event_id = ${draftId(d.slug)};`);
  for (const s of d.sources) {
    out.push(`insert into sources (event_id, title, url, kind) select id, ${q(s.title)}, ${q(s.url)}, ${q(s.kind)} from events where slug = ${q(d.slug)} and status = 'draft';`);
  }
}

// Links in a second pass so every target of this batch exists. builds_on: this -> target; enables: target -> this (ADR-007).
// Only while this draft is a draft: a published event's link set is edited by humans, not by the loader.
for (const d of drafts) {
  for (const t of d.builds_on.filter((s) => !s.endsWith("?"))) {
    out.push(`insert into event_links (from_event_id, to_event_id, type) select a.id, b.id, 'builds_on' from events a, events b where a.slug = ${q(d.slug)} and a.status = 'draft' and b.slug = ${q(t)} on conflict do nothing;`);
  }
  for (const t of d.enables.filter((s) => !s.endsWith("?"))) {
    out.push(`insert into event_links (from_event_id, to_event_id, type) select a.id, b.id, 'builds_on' from events a, events b where a.slug = ${q(t)} and b.slug = ${q(d.slug)} and b.status = 'draft' on conflict do nothing;`);
  }
}
out.push("commit;");
process.stdout.write(out.join("\n") + "\n");

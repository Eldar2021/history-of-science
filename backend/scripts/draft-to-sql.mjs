#!/usr/bin/env node
/**
 * Turn backend/content/drafts/*.json into idempotent SQL. This is the loader for the four-language
 * draft contract the content pipeline produces (ADR-036); the old single-language one was
 * drafts-to-sql.mjs.
 *
 *   node backend/scripts/draft-to-sql.mjs [dir|file] \
 *     | docker exec -i supabase_db_uchkun psql -U postgres -d postgres -v ON_ERROR_STOP=1
 *
 * Writes events as status='review'. Every statement is guarded by `status <> 'published'`, so once a
 * human has published an event this script can no longer change it (ADR-014: publishing, and keeping
 * something published, is a human act).
 *
 * builds_on links are inserted only where BOTH ends already exist. Events arrive in importance order,
 * not chronological order, so a draft usually names targets that are not written yet. There is no
 * pending-link state anywhere: run this over the whole drafts directory and every link whose two ends
 * now exist is inserted, so the graph completes itself as the list fills in.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const target = process.argv[2] ?? "backend/content/drafts";
const files = statSync(target).isDirectory()
  ? readdirSync(target).filter((f) => f.endsWith(".json")).map((f) => join(target, f))
  : [target];
const drafts = files.map((f) => JSON.parse(readFileSync(f, "utf8")));

const LOCALES = ["en", "ru", "ky", "tr"];
const DISCIPLINES = ["mathematics","physics","astronomy","chemistry","biology","medicine","earth","technology"];
const ALERTS = ["note","tip","important","warning","caution","theory"];

/**
 * The contract, checked before anything reaches the database. The pipeline runs unattended, so a
 * malformed draft has to fail here rather than land half-written and be found by a reader.
 */
function validate(d) {
  const e = [];
  const need = (c, m) => { if (!c) e.push(m); };
  need(/^[a-z0-9-]+$/.test(d.slug ?? ""), "slug must be lowercase-with-hyphens");
  need(Number.isInteger(d.year) && d.year !== 0, "year must be a non-zero integer");
  need(["exact","circa","decade","century"].includes(d.precision), "bad precision");
  need(Number.isInteger(d.importance) && d.importance >= 1 && d.importance <= 5, "importance must be 1-5");
  need(d.disciplines?.length >= 1, "at least one discipline");
  for (const s of d.disciplines ?? []) need(DISCIPLINES.includes(s), `unknown discipline: ${s}`);
  need((d.sources ?? []).length >= 2, "at least two sources (icerik.md)");
  need((d.sources ?? []).some((s) => s.kind === "encyclopedia"), "at least one encyclopedia source");

  const img = d.image ?? {};
  if (img.path) need(img.credit && img.license && img.source_url,
    "a cover image needs credit, licence and source url (ADR-011)");

  need(d.translations?.[d.source_locale ?? "en"], "the source locale must have a translation");
  for (const [loc, t] of Object.entries(d.translations ?? {})) {
    need(LOCALES.includes(loc), `unknown locale: ${loc}`);
    need(t.title?.trim(), `${loc}: title is empty`);
    need(t.summary?.trim(), `${loc}: summary is empty`);
    // 200 characters is a layout constraint: the timeline card and the OG image are built for it.
    need((t.summary ?? "").length <= 200, `${loc}: summary is ${t.summary?.length} characters, max 200`);
    for (const m of (t.body ?? "").matchAll(/^> \[!(\w+)\]/gm))
      need(ALERTS.includes(m[1].toLowerCase()), `${loc}: unknown callout [!${m[1]}]`);
    // A Markdown image must not smuggle an uncredited picture past the licence rule.
    for (const m of (t.body ?? "").matchAll(/^!\[[^\]]*\]\(\S+(\s+"([^"]*)")?\)$/gm))
      need((m[2] ?? "").includes("·"), `${loc}: a figure has no "Author · Licence · URL" caption`);
  }
  if (e.length) throw new Error(`${d.slug ?? "(no slug)"}:\n  - ${e.join("\n  - ")}`);
}

const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (v == null ? "null" : String(v));
/** id of the event, but only while it is not published. */
const eid = (slug) => `(select id from events where slug = ${q(slug)} and status <> 'published')`;

const out = ["begin;"];

for (const d of drafts) {
  if (d.status !== "review") throw new Error(`${d.slug}: this script only loads status='review' drafts`);
  validate(d);
  const img = d.image ?? {};

  out.push(`
-- ${d.slug} (${d.year})
insert into events (slug, year, year_end, precision, importance, status, drafted_by, source_locale,
                    research_note, image_path, image_credit, image_license, image_source_url,
                    lat, lng, place_precision)
values (${q(d.slug)}, ${d.year}, ${num(d.year_end)}, ${q(d.precision)}, ${d.importance}, 'review', ${q(d.drafted_by ?? "ai")},
        ${q(d.source_locale ?? "en")}, ${q(d.research_note)}, ${q(img.path)}, ${q(img.credit)}, ${q(img.license)},
        ${q(img.source_url)}, ${num(d.lat)}, ${num(d.lng)}, ${q(d.place_precision ?? "unknown")})
on conflict (slug) do update set
  year = excluded.year, year_end = excluded.year_end, precision = excluded.precision,
  importance = excluded.importance, drafted_by = excluded.drafted_by, research_note = excluded.research_note,
  image_path = excluded.image_path, image_credit = excluded.image_credit, image_license = excluded.image_license,
  image_source_url = excluded.image_source_url, lat = excluded.lat, lng = excluded.lng,
  place_precision = excluded.place_precision
where events.status <> 'published';`);

  for (const [locale, t] of Object.entries(d.translations)) {
    out.push(`
insert into event_translations (event_id, locale, title, summary, body, why_it_matters, if_you_were_there, place_name, status)
select id, ${q(locale)}, ${q(t.title)}, ${q(t.summary)}, ${q(t.body)}, ${q(t.why_it_matters)},
       ${q(t.if_you_were_there)}, ${q(t.place_name)}, ${q(t.status ?? "machine")}
from events where slug = ${q(d.slug)} and status <> 'published'
on conflict (event_id, locale) do update set
  title = excluded.title, summary = excluded.summary, body = excluded.body,
  why_it_matters = excluded.why_it_matters, if_you_were_there = excluded.if_you_were_there,
  place_name = excluded.place_name, status = excluded.status;`);
  }

  out.push(`
delete from event_disciplines where event_id = ${eid(d.slug)};
insert into event_disciplines (event_id, discipline_id, is_primary)
select ${eid(d.slug)}, d.id, d.slug = ${q(d.disciplines[0])}
from disciplines d where d.slug in (${d.disciplines.map(q).join(", ")})
  and ${eid(d.slug)} is not null;`);

  for (const p of d.people ?? []) {
    out.push(`
insert into people (slug, birth_year, death_year) values (${q(p.slug)}, ${num(p.birth_year)}, ${num(p.death_year)})
on conflict (slug) do update set birth_year = excluded.birth_year, death_year = excluded.death_year;`);
    for (const [locale, name] of Object.entries(p.name)) {
      out.push(`insert into person_translations (person_id, locale, name)
select id, ${q(locale)}, ${q(name)} from people where slug = ${q(p.slug)}
on conflict (person_id, locale) do update set name = excluded.name;`);
    }
    out.push(`insert into event_people (event_id, person_id, role)
select ${eid(d.slug)}, id, ${q(p.role)} from people where slug = ${q(p.slug)} and ${eid(d.slug)} is not null
on conflict (event_id, person_id) do update set role = excluded.role;`);
  }

  out.push(`delete from sources where event_id = ${eid(d.slug)};`);
  for (const s of d.sources ?? []) {
    out.push(`insert into sources (event_id, title, url, kind)
select ${eid(d.slug)}, ${q(s.title)}, ${q(s.url)}, ${q(s.kind)} where ${eid(d.slug)} is not null;`);
  }

  for (const to of d.builds_on ?? []) {
    out.push(`insert into event_links (from_event_id, to_event_id, type)
select f.id, t.id, 'builds_on' from events f, events t
where f.slug = ${q(d.slug)} and t.slug = ${q(to)} and f.id <> t.id
on conflict do nothing;`);
  }
}

out.push("\ncommit;");
process.stdout.write(out.join("\n") + "\n");

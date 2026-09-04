#!/usr/bin/env node
// Lints event drafts in backend/content/drafts against doc/icerik.md (template limits) and the schema enums.
// Usage: node backend/scripts/check-drafts.mjs [dir]   (exit 1 when any draft has an error)
// Dependency-free on purpose: the nightly pipeline (week 5) will reuse these checks.
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const dir = process.argv[2] ?? join(import.meta.dirname, "../content/drafts");
const DISCIPLINES = new Set(["mathematics", "physics", "astronomy", "chemistry", "biology", "medicine", "earth", "technology"]);
const PRECISION = new Set(["exact", "circa", "decade", "century"]);
const KINDS = new Set(["encyclopedia", "book", "paper", "article", "other"]);
const SEED_SLUGS = [...readFileSync(join(import.meta.dirname, "../supabase/seed.sql"), "utf8").matchAll(/seed_event\('([a-z0-9-]+)'/g)].map((m) => m[1]);

const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const drafts = files.map((f) => ({ file: f, data: JSON.parse(readFileSync(join(dir, f), "utf8")) }));
const known = new Set([...SEED_SLUGS, ...drafts.map((d) => d.data.slug)]);
const words = (s) => (s ?? "").trim().split(/\s+/).filter(Boolean).length;

let errors = 0, warnings = 0;
for (const { file, data: d } of drafts) {
  const problems = [], notes = [];
  const err = (m) => problems.push(m), warn = (m) => notes.push(m);
  for (const k of ["slug", "year", "precision", "importance", "title", "summary", "body", "why_it_matters", "if_you_were_there", "disciplines", "people", "builds_on", "enables", "sources", "verify_note_tr", "drafted_by", "source_locale", "status"])
    if (!(k in d)) err(`missing field ${k}`);
  if (d.slug !== basename(file, ".json")) err(`slug ${d.slug} != filename`);
  if (!/^[a-z0-9-]+$/.test(d.slug ?? "")) err("slug not kebab-case");
  if (!Number.isInteger(d.year) || d.year === 0) err(`year ${d.year}`);
  if (d.year_end != null && (!Number.isInteger(d.year_end) || d.year_end === 0 || d.year_end < d.year)) err(`year_end ${d.year_end}`);
  if (!PRECISION.has(d.precision)) err(`precision ${d.precision}`);
  if (!(Number.isInteger(d.importance) && d.importance >= 1 && d.importance <= 5)) err(`importance ${d.importance}`);
  if ((d.title ?? "").length > 80) err(`title ${d.title.length} chars > 80`);
  if ((d.summary ?? "").length > 200) err(`summary ${d.summary.length} chars > 200`);
  const w = words(d.body);
  if (w < 300 || w > 600) (w < 250 || w > 700 ? err : warn)(`body ${w} words (300-600)`);
  for (const h of ["### The scene", "### What happened", "### Why it was hard", "### What it opened"]) if (!(d.body ?? "").includes(h)) warn(`body lacks "${h}"`);
  if (/[=+×÷]|\^\d|\\\(/.test(d.body ?? "")) warn("body may contain a formula");
  if (!Array.isArray(d.disciplines) || d.disciplines.length < 1 || d.disciplines.length > 3) err("disciplines: 1-3 required");
  for (const s of d.disciplines ?? []) if (!DISCIPLINES.has(s)) err(`unknown discipline ${s}`);
  for (const p of d.people ?? []) if (!p.name || !p.role) err(`person without name/role: ${JSON.stringify(p)}`);
  for (const key of ["builds_on", "enables"]) for (const s of d[key] ?? []) {
    if (s.endsWith("?")) warn(`${key}: ${s} (target not written yet)`);
    else if (!known.has(s)) err(`${key}: unknown slug ${s}`);
    else if (s === d.slug) err(`${key}: links to itself`);
  }
  if (!Array.isArray(d.sources) || d.sources.length < 3) err(`sources: ${d.sources?.length ?? 0} < 3`);
  for (const s of d.sources ?? []) { if (!s.title || !s.url) err(`source without title/url: ${JSON.stringify(s)}`); if (s.kind && !KINDS.has(s.kind)) err(`source kind ${s.kind}`); }
  if (!/[çğıöşüÇĞİÖŞÜ]|doğrula|kontrol/.test(d.verify_note_tr ?? "")) warn("verify_note_tr does not look Turkish");
  if (d.status !== "draft") err(`status ${d.status} (must be draft)`);
  if (d.drafted_by !== "ai") warn(`drafted_by ${d.drafted_by}`);
  if (d.source_locale !== "en") warn(`source_locale ${d.source_locale}`);
  errors += problems.length; warnings += notes.length;
  const tag = problems.length ? "ERR " : notes.length ? "warn" : "ok  ";
  console.log(`${tag} ${file}  (${d.year} ${d.precision}, imp ${d.importance}, ${w} words, ${d.sources?.length ?? 0} sources)`);
  for (const p of problems) console.log(`      ! ${p}`);
  for (const n of notes) console.log(`      - ${n}`);
}
console.log(`\n${files.length} drafts, ${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);

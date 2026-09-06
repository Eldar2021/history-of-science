#!/usr/bin/env node
/**
 * Print the next event the pipeline should write.
 *
 *   next = the lowest `rank` in backend/content/top100.json whose slug has no row in `events` yet.
 *
 * The position is derived from the database every time; there is no cursor file (ADR-036). That is
 * what lets the nightly run and a run started by hand exist at the same time without overwriting each
 * other, and what makes a failed run cost nothing: the slot is simply still empty next time.
 *
 *   node backend/scripts/pipeline/next-event.mjs            # the next event, as JSON
 *   node backend/scripts/pipeline/next-event.mjs --status    # how far along the list is
 *
 * Exit codes: 0 = there is an event to write, 3 = the list is finished (see extension-queue.json),
 * 4 = the review queue is already full. The queue guard is ADR-014: unreviewed drafts piling up means
 * the human is the bottleneck, and writing more of them helps nobody. Raise it with REVIEW_QUEUE_LIMIT.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot, selectRows, supabaseCredentials } from "./env.mjs";

const queuePath = join(repoRoot, "backend", "content", "top100.json");
const queue = JSON.parse(readFileSync(queuePath, "utf8"));

const { isLocal } = supabaseCredentials();
// The local database is seeded with 10 e2e fixtures whose slugs are real top100 slugs. The queue
// position computed here is therefore *not* production's, and a draft written against it would be for
// the wrong event. Loud, because getting this wrong wastes a whole run.
const localWarning = isLocal
  ? "TARGET IS THE LOCAL DATABASE. Its 10 published rows are e2e fixtures, not content, so this " +
    "position is not production's. For a real run set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
    "to the cloud project."
  : null;
if (localWarning) console.error(`warning: ${localWarning}`);

const rows = await selectRows("events?select=slug,status");
const inDatabase = new Map(rows.map((r) => [r.slug, r.status]));

const awaitingReview = rows.filter((r) => r.status === "review").length;
const reviewLimit = Number(process.env.REVIEW_QUEUE_LIMIT ?? 10);

const byRank = [...queue.events].sort((a, b) => a.rank - b.rank);
const written = byRank.filter((e) => inDatabase.has(e.slug));
const next = byRank.find((e) => !inDatabase.has(e.slug));

if (process.argv.includes("--status")) {
  const counts = written.reduce((a, e) => ({ ...a, [inDatabase.get(e.slug)]: (a[inDatabase.get(e.slug)] ?? 0) + 1 }), {});
  console.log(`${written.length}/${byRank.length} written` + (written.length ? ` (${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ")})` : ""));
  console.log(`awaiting review: ${awaitingReview} (limit ${reviewLimit})`);
  console.log(next ? `next: rank ${next.rank} — ${next.slug}` : "next: none, the list is finished");
  process.exit(next ? 0 : 3);
}

if (awaitingReview >= reviewLimit && !process.argv.includes("--status")) {
  console.log(JSON.stringify({
    queue_full: true,
    awaiting_review: awaitingReview,
    limit: reviewLimit,
    message: `${awaitingReview} events are already waiting for review. Publish or reject some in /admin, ` +
      "or raise REVIEW_QUEUE_LIMIT. Writing more drafts now would only lengthen the queue (ADR-014).",
  }, null, 2));
  process.exit(4);
}

if (!next) {
  console.log(JSON.stringify({
    done: true,
    warning: localWarning,
    written: written.length,
    message: "Every event in top100.json exists in the database. Do not invent an event: the extension " +
      "queue is backend/content/extension-queue.json and adding from it is the user's decision (ADR-036).",
  }, null, 2));
  process.exit(3);
}

// Neighbours already in the database are the only honest `builds_on` targets for this run: the loader
// drops a link whose other end does not exist yet, so naming one is not an error, just a no-op.
console.log(JSON.stringify({
  ...next,
  warning: localWarning,
  written: written.length,
  total: byRank.length,
  existing_slugs: byRank.filter((e) => inDatabase.has(e.slug)).map((e) => e.slug),
}, null, 2));

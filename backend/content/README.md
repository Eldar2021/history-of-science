# backend/content

The content pipeline's data (ADR-036).

- `top100.json` — the production queue: 100 events, `rank` is the order they are written.
  `importance` is the event's weight on the timeline; the two are not the same thing.
- `extension-queue.json` — the 35 candidates that did not make the top 100. When the list runs out,
  this is where it is extended from.
- `drafts/<slug>.json` — one event per file, all four languages, always `status: "review"`.
  Publishing is a human action (ADR-014), so nothing here writes `published`.

Load a draft with `node backend/scripts/draft-to-sql.mjs <file|dir> | psql ...`. It validates the
draft against the contract first (summary length, licences, callout kinds, two sources) and refuses
to touch an event a human has already published.

`builds_on` may name events that do not exist yet — the list is written in importance order, not
chronological order. Links are inserted only where both ends exist, so running the loader over the
whole directory fills the graph in as the list completes. There is no pending-link state to keep.

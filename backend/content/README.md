# backend/content

Hand-run content drafts, before the nightly pipeline (week 5) exists.

- `drafts/<slug>.json` — one event per file, written by `/com_event` (Claude, `drafted_by: "ai"`), always `status: "draft"`.
  Field names match `events` + `event_translations` (04-mimari). `verify_note_tr` lists what the reviewer must check.
- Slugs ending in `?` inside `builds_on` / `enables` point at core-list events not written yet; drop the `?` once the target exists.
- Review flow: read the draft, open the sources, fix the text, then either paste it into the admin form (week 4) or ask
  Claude to load it into the local DB as `draft`. Publishing is always a human action (ADR-014).

# Uchkun content pipeline — one run

You are writing **one** event for Uchkun, a four-language science-history timeline. A run produces a
draft in the database with `status='review'`. A human publishes; you never do (ADR-014).

Work in the repository root. Do the steps in order and stop at the first one that cannot be done
honestly — an empty slot next run costs nothing, a wrong event costs the reader's trust.

## 1. Read the contract

- `doc/icerik.md` in full: eras, disciplines, the template, the body tools table, the voice rules,
  the accuracy process, the Central Asia emphasis.
- `CLAUDE.md` for the project rules.
- `doc/i18n.md` only if a language question comes up.

## 2. Take the next event

```
node backend/scripts/pipeline/next-event.mjs
```

- Exit code **3** means the list is finished. Do not invent an event and do not take one from
  `extension-queue.json` — report that the list is done and ask whether to extend it. Stop.
- A `warning` field in the output means you are pointed at the local database, whose ten published rows
  are e2e fixtures. Say so in the report; the position is not production's.
- `existing_slugs` is what already exists — the only `builds_on` targets that will actually link. Naming
  one that does not exist yet is allowed and simply does nothing.

## 3. Research

Web search. At least two independent sources, one an encyclopedia (Britannica, Stanford Encyclopedia of
Philosophy, English Wikipedia, MacTutor, university or museum pages). Britannica blocks automated
fetches — link it for the human, meet the threshold with the others.

- If sources disagree on the year, set `precision` to `circa` and say so in the body.
- Separate legend from record. An anecdote that rests on one late account is introduced as that, not
  staged as fact.
- Find who came before and who was left out — co-discoverers, women, non-Western contributors. No
  lone-hero framing.

## 4. Images, licence read not asserted

```
node backend/scripts/pipeline/commons.mjs --search "<person, book, instrument>"
node backend/scripts/pipeline/commons.mjs "File:<name>"
```

The second command prints `path`, `credit`, `license`, `source_url` and the exact `caption` string the
body wants. Use those values verbatim. A file the script refuses is not used — do not talk yourself into
it, pick another. One cover image plus one to three figures in the body where the subject earns them.

If nothing suitable is free, the event ships without a cover: the site draws a generated card. An event
is never held back waiting for a picture.

## 5. Write it, four languages

English is the source. Then Turkish, Russian, and Kyrgyz with the Turkish and Russian versions in view.
**Before writing Kyrgyz, read `backend/scripts/glossary.ky.json`** and use its terms; entries marked
`"confidence": "check"` are unconfirmed guesses — if you use one, list it in the report so the user can
check it. Non-English translations get `"status": "machine"`.

- Summary: **200 characters maximum**. This is a layout rule (timeline card, OG image), not a style one.
- Body: **no word ceiling.** Length follows the material — importance 5 goes deep, importance 3 stops
  early. Every paragraph brings a new fact; a paragraph that restates the one before it gets cut.
- Four movements: the scene, what happened, why it was hard, what it opened.
- One analogy, plus one sentence on where the analogy breaks.
- No formulas in the narrative. `$...$` is the exception, with its explanation beside it.
- Callout keywords are English (`> [!NOTE]`, `> [!THEORY]`, …); the text inside them is in the target
  language.

Write the draft to `backend/content/drafts/<slug>.json` in the contract shape. `research_note` records
what was confirmed, what is flagged in the body, and what the reviewer should check.

## 6. Verify adversarially, before loading

Run the `fact-checker` agent on the draft file. It reports; you fix. Treat "belirsiz" as a reason to
soften the claim in the body or drop it, not as a reason to publish it louder. Carry anything it could
not confirm into `research_note`.

## 7. Load

```
backend/scripts/pipeline/load.sh backend/content/drafts/<slug>.json
```

The contract check runs inside the loader and cannot be skipped. If it fails, fix the draft and run it
again — never edit the loader to make a draft pass. It writes `status='review'` only.

## 8. Report, in Turkish

At most eight lines:

- which event, which rank, how far the list has come;
- what the fact-checker flagged and what you did about it;
- anything the user must verify by hand: a contested year, a priority dispute, a Kyrgyz term marked
  `check`, an image whose author line looked thin;
- the admin link to review it.

Never write `status='published'` anywhere, and never mark a translation `human`. That is the user's act.

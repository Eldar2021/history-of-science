Run one turn of the content pipeline by hand, inside this session. Arguments: $ARGUMENTS (optional: a slug or a working title to write instead of the queue's next event).

This is the same work the nightly run does, with you watching. The instructions are in
`backend/scripts/pipeline/prompts/run.md` — **read that file and follow it step by step.**

Only these differences apply here:

- If `$ARGUMENTS` names an event, write that one instead of running `next-event.mjs`. It still has to be
  in `backend/content/top100.json`; if it is not, say so and stop rather than inventing a slot.
- Say out loud which database you are pointed at before writing anything. Without `SUPABASE_URL` in the
  environment this is the **local** one, whose ten published rows are e2e fixtures — a draft loaded there
  never reaches the site. For a run that counts, the cloud credentials have to be in the environment
  (`doc/mimari.md`, "İçerik hattı").
- The final report is in Turkish, to the user, in this session. No Telegram.

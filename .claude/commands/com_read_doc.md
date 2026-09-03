Load the project context for the Uchkun science-history timeline at the start of a session. Do this before any other work.

Read only what you need. The docs are small now, but the point of this command is a briefing, not a full recital.

1. Read `CLAUDE.md` (root) for rules and conventions.
2. Read `doc/STATUS.md`: current phase, open items, what is waiting on the user, last session.
3. Read `doc/00-README.md` for the map of the remaining docs.
4. Run `git log --oneline -10` and `git status --short`.
5. Read **only the docs the session's work touches**:
   - content or event writing → `doc/03-icerik-stratejisi.md`
   - schema, queries, caching, pipeline, deployment → `doc/04-mimari.md`
   - languages, year formatting, translation → `doc/06-i18n-stratejisi.md`
   - starting or planning a week → `doc/08-yol-haritasi.md`
   - questioning or changing a decision → `doc/09-kararlar-ADR.md`
   - risks, open questions, parked ideas → `doc/10-riskler-ve-acik-sorular.md`
     If the session's subject is not clear yet, stop after step 4 and ask.

Then reply in Turkish with a briefing of at most ~12 lines:

- Which week/phase we are in and the milestone we are working toward.
- The open items, in order.
- Anything blocked or waiting on the user.
- The single next action you propose, then wait for the go-ahead unless the user already said continue.

Do not summarize the docs themselves; the user wrote them. Summarize the state.

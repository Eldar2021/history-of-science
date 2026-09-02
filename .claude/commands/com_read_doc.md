Load the full project context for the Uchkun science-history timeline at the start of a session. Do this before any other work.

1. Read `CLAUDE.md` (root) for rules and conventions.
2. Read `doc/STATUS.md` for the current phase, this week's checkboxes, what is waiting on the user, and the last session log.
3. Read `doc/00-README.md`, then every numbered doc in `doc/` (01 through 11). If context is tight, prioritize: 08 (roadmap), 04 (architecture), 02 (spec), 09 (ADRs), then the rest.
4. Run `git log --oneline -15` and `git status --short` to see recent work and uncommitted changes.
5. If `web/package.json` exists, read it for available scripts. If `backend/supabase/migrations/` exists, list the files.

After reading, reply in Turkish with a short briefing (no more than ~15 lines):

- Which week/phase we are in and the milestone we are working toward.
- The open checkboxes for this week, in order.
- Anything blocked or waiting on the user.
- The single next action you propose to take now, then wait for the user's go-ahead unless they already told you to continue.

Do not summarize the docs themselves; the user wrote them. Summarize the state.

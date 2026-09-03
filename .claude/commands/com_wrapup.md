End the current session cleanly so the next session can pick up without re-explaining anything.

1. Run `git status --short` and `git diff --stat` to see what changed this session.
2. Update `doc/STATUS.md`:
   - "Şu an" block: current week, next step, what is waiting on the user, blockers.
   - Tick completed checkboxes for this week; move unfinished ones forward with a one-line reason if they slipped.
   - Add a dated entry (YYYY-MM-DD) at the top of "Oturum günlüğü": what was done, what was left half-done (with file names), decisions taken, problems found.
3. If a decision was made this session that changes architecture, product scope or process, add an ADR to `doc/09-kararlar-ADR.md` using the template at the bottom. If a new risk or idea came up, add it to `doc/10-riskler-ve-acik-sorular.md` (risk list or "Park").
4. If the roadmap week's checkboxes in `doc/08-yol-haritasi-3-ay.md` were completed, tick them there too.
5. If `web/` exists, run `npm run check` and report the result honestly; do not commit failing code without telling the user.
6. Stage and commit all changes with a conventional message (`chore(docs): session wrap-up YYYY-MM-DD` for doc-only changes, otherwise a message describing the code). Do NOT push unless the user asked.
7. Reply in Turkish with 5 lines max: what was done, what is next, what the user must do before the next session.

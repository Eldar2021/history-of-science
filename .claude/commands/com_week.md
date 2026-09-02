Start (or continue) roadmap week $ARGUMENTS for the Uchkun project.

1. Read `doc/STATUS.md` and `CLAUDE.md`.
2. In `doc/08-yol-haritasi-3-ay.md`, find the section "Hafta $ARGUMENTS". Read its Kod, Tasarım and İçerik checkboxes and the "Hafta sonu kontrolü" / milestone line.
3. Read the docs that week depends on (e.g. 04 for schema work, 05 for timeline UI, 06 for i18n, 07 for design tokens, 03 for content).
4. Copy the week's checkboxes into `doc/STATUS.md` under "## Hafta $ARGUMENTS kutucukları" if they are not already there, and set the "Şu an" block to this week.
5. Reply in Turkish with a plan: the checkboxes in the order you will do them, which ones need the user (accounts, design review, content approval), and any decision to confirm. Keep it short.
6. Once the user says go, work through the Kod checkboxes one at a time. After each one: run `npm run check` in `web/` if it exists, commit with `type(scope): summary`, tick the box in `doc/STATUS.md`.
7. Stop at any checkbox that needs the user and say exactly what they must do.

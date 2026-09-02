Run the full quality check for the Uchkun web app and report honestly.

1. In `web/`: run `npx tsc --noEmit`, then `npx eslint .`, then `npx vitest run` (if tests exist). Use `npm run check` if that script exists instead.
2. If `backend/scripts/check-i18n.ts` exists, run it (`npm run check:i18n` in `backend/`).
3. If Playwright tests exist and a dev server can be started, run `npx playwright test`; otherwise skip and say so.
4. Fix trivial issues (lint autofix, unused imports) directly. For anything else, list the failure with file:line and propose the fix; do not silently change behavior.
5. Reply in Turkish with a table: check name, pass/fail, note. End with one line: safe to commit or not.

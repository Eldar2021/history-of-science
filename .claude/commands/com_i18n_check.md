Check the four-language (en, ru, ky, tr) consistency of the Uchkun project.

1. Read `doc/i18n.md` for the rules (URL structure, year formatting table, Kyrgyz letters, Turkish casing, string length).
2. Compare `web/messages/en.json` against `ru.json`, `ky.json`, `tr.json`: list keys missing or empty in any language, and keys present in a translation but not in English (stale).
3. Grep `web/` for hardcoded user-facing strings in JSX (text between tags or in `placeholder`/`aria-label`/`title` props that is not a `t(...)` call). List them with file:line.
4. Grep for `.toUpperCase(` and `.toLowerCase(` in `web/`; flag any applied to user-visible Turkish/Kyrgyz text.
5. Check that `web/lib/i18n/formatYear.ts` has tests covering 4 locales × 4 precisions × BCE/CE (32 cases). Report which cases are missing.
6. If Supabase is reachable, run a query (or `backend/scripts/check-i18n.ts`) to list published events missing a translation in any locale, and count `machine` vs `reviewed` per locale.
7. Reply in Turkish with a short report and, if there are missing UI keys, offer to draft the translations (mark drafts clearly as machine translations for the user to review; Kyrgyz drafts should be produced with the Turkish and Russian strings as reference).

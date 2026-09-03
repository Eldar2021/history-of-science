Record an architecture/product decision as an ADR. Arguments: $ARGUMENTS (a short description of the decision; if empty, ask the user what was decided).

1. Read `doc/09-kararlar-ADR.md` to find the next ADR number and the template at the bottom.
2. Check whether an existing ADR covers the same topic. If so, do not duplicate: mark the old one `Geçersiz (bkz. ADR-0NN)` and write the new one referencing it.
3. Write the new ADR in Turkish with today's date (YYYY-MM-DD): Bağlam, Karar, Gerekçe, Sonuçlar, Alternatifler. Keep it under 10 lines.
4. If the decision changes anything in other docs (02 spec, 04 architecture, 05 UX, 06 i18n, 08 roadmap), update those docs in place and mention which ones you touched.
5. If it affects `CLAUDE.md` rules, update that too.
6. Reply in Turkish with the ADR number and a one-line summary. Do not commit unless asked.

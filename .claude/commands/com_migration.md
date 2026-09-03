Create a new database migration for the Uchkun schema. Arguments: $ARGUMENTS (what the change is).

1. Read `doc/04-mimari.md` (data model section) and list the existing files in `backend/supabase/migrations/` to find the next number (`NNNN_snake_case.sql`).
2. Before writing SQL, summarize in Turkish what tables/columns/policies change and why, and whether any existing data needs a backfill. Wait for confirmation if the change is destructive (drop, rename, type change on a populated column).
3. Write the migration: idempotent where practical, with RLS policies for any new table (public `select` only for `status='published' and deleted_at is null` where applicable; write access only for `profiles.role in ('admin','editor')`). Update views/functions that depend on changed tables.
4. Update the data-model table in `doc/04-mimari.md` so it matches the migration. Keep it a summary; the SQL files are the source of truth.
5. If Docker and the Supabase CLI are available, run `supabase db reset` in `backend/` and then `npm run gen:types` in `web/`. If not, say so and tell the user the two commands to run.
6. Update any TypeScript queries or types affected, run `npm run check` in `web/`, and report the result.

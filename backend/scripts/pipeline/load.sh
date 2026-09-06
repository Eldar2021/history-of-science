#!/usr/bin/env bash
# Validate a draft and load it into the database as status='review'.
#
#   backend/scripts/pipeline/load.sh backend/content/drafts/<slug>.json
#   backend/scripts/pipeline/load.sh --dry-run backend/content/drafts        # validate the whole dir
#
# The contract check lives inside draft-to-sql.mjs and cannot be skipped: a malformed draft fails here
# instead of landing half-written (ADR-036). Every statement is guarded by `status <> 'published'`, so
# this can never touch an event the user has already published (ADR-014).
#
# Target: SUPABASE_DB_URL if it is set (the cloud project), otherwise the local Supabase container.
# psql comes from PATH when there is one, and from the local Supabase container when there is not —
# that container's psql can reach the cloud perfectly well, so a laptop with no postgres client
# installed can still run a real load.
set -euo pipefail

DRY=0
if [ "${1:-}" = "--dry-run" ]; then DRY=1; shift; fi
TARGET="${1:-backend/content/drafts}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CONTAINER="${SUPABASE_DB_CONTAINER:-supabase_db_uchkun}"

SQL="$(node "$ROOT/backend/scripts/draft-to-sql.mjs" "$TARGET")"

if [ "$DRY" = 1 ]; then
  echo "$SQL"
  echo "-- validated, nothing written (--dry-run)" >&2
  exit 0
fi

if [ -n "${SUPABASE_DB_URL:-}" ]; then
  echo "target: cloud database (SUPABASE_DB_URL)" >&2
  if command -v psql >/dev/null 2>&1; then
    printf '%s\n' "$SQL" | psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q
  else
    printf '%s\n' "$SQL" | docker exec -i "$CONTAINER" psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q
  fi
else
  echo "target: LOCAL database ($CONTAINER) — content written here does not reach the site" >&2
  printf '%s\n' "$SQL" | docker exec -i "$CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q
fi

echo "loaded: $TARGET" >&2

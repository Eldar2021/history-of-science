#!/usr/bin/env bash
# Dump the Uchkun database by hand. The nightly copy is .github/workflows/backup.yml; this is for
# "I am about to do something frightening" moments.
#
#   backend/scripts/backup.sh                 # the linked cloud project
#   backend/scripts/backup.sh --local         # the local database
#
# Writes backup/<timestamp>/{schema,data,roles}.sql, which `psql -f` restores in that order.
set -euo pipefail
cd "$(dirname "$0")/.."

STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
OUT="backup/$STAMP"
mkdir -p "$OUT"

if [[ "${1:-}" == "--local" ]]; then
  TARGET=(--local)
  echo "→ Local database"
else
  TARGET=(--linked)
  echo "→ Linked cloud project (supabase link, if you have not)"
fi

supabase db dump "${TARGET[@]}" -f "$OUT/schema.sql"
supabase db dump "${TARGET[@]}" -f "$OUT/data.sql" --data-only
supabase db dump "${TARGET[@]}" -f "$OUT/roles.sql" --role-only

echo
echo "→ $OUT"
ls -lh "$OUT"
echo
echo "Restore, in this order: roles.sql, schema.sql, data.sql"

#!/usr/bin/env bash
# Sets (or resets) the password of a cloud admin/editor account and makes sure of its role.
# The service_role key comes from the logged-in Supabase CLI; the password is typed, never on
# the command line or in shell history. Needs `jq`.
#   backend/scripts/cloud-admin-password.sh <email> [admin|editor]
set -euo pipefail
cd "$(dirname "$0")/.."
REF=hsllmvouqayaccubodcl
EMAIL="${1:?usage: cloud-admin-password.sh <email> [admin|editor]}"
ROLE="${2:-admin}"

KEY=$(supabase projects api-keys --project-ref "$REF" -o json | jq -r '.[] | select(.name=="service_role") | .api_key')
[[ -n "$KEY" ]] || { echo "service_role key not found; run 'supabase login' first"; exit 1; }

read -r -s -p "New password for $EMAIL (min 8 chars, hidden): " PW; echo
read -r -s -p "Again: " PW2; echo
[[ "$PW" == "$PW2" ]] || { echo "passwords differ"; exit 1; }
[[ ${#PW} -ge 8 ]] || { echo "too short"; exit 1; }

SUPABASE_URL="https://$REF.supabase.co" SUPABASE_SERVICE_ROLE_KEY="$KEY" node scripts/create-admin.mjs "$EMAIL" "$PW" "$ROLE"
echo "done → sign in at /admin/login"

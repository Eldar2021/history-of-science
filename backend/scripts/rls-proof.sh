#!/usr/bin/env bash
# Proves at the API level that drafts never leave the database for anonymous callers (ADR-010).
# Uses only the anon key, exactly like a visitor's browser. Exit 1 on any leak.
#   backend/scripts/rls-proof.sh                 # local (reads web/.env.local)
#   SUPABASE_URL=… SUPABASE_ANON_KEY=… backend/scripts/rls-proof.sh   # cloud
set -euo pipefail
cd "$(dirname "$0")/../.."
if [[ -z "${SUPABASE_URL:-}" && -f web/.env.local ]]; then
  SUPABASE_URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' web/.env.local | cut -d= -f2-)
  SUPABASE_ANON_KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' web/.env.local | cut -d= -f2-)
fi
: "${SUPABASE_URL:?}" "${SUPABASE_ANON_KEY:?}"
H=(-s -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY")
fail=0
check() { # name, jq expr, expected
  local got; got=$(echo "$2" | jq -r "$3")
  if [[ "$got" == "$4" ]]; then echo "ok   $1 → $got"; else echo "FAIL $1 → $got (expected $4)"; fail=1; fi
}

echo "anon vs $SUPABASE_URL"
r=$(curl "${H[@]}" "$SUPABASE_URL/rest/v1/events?select=status&status=neq.published")
check "events table: non-published rows" "$r" 'length' 0
r=$(curl "${H[@]}" "$SUPABASE_URL/rest/v1/events?select=status&deleted_at=not.is.null")
check "events table: soft-deleted rows" "$r" 'length' 0
r=$(curl "${H[@]}" "$SUPABASE_URL/rest/v1/event_translations?select=event_id,events!inner(status)&events.status=neq.published")
check "event_translations of non-published" "$r" 'length' 0
r=$(curl "${H[@]}" "$SUPABASE_URL/rest/v1/sources?select=event_id,events!inner(status)&events.status=neq.published")
check "sources of non-published" "$r" 'length' 0
r=$(curl "${H[@]}" -X POST -H "Content-Type: application/json" "$SUPABASE_URL/rest/v1/rpc/get_timeline" -d '{"p_locale":"en"}')
check "get_timeline: every row published" "$r" '[.[] | select(.status? != null and .status != "published")] | length' 0
published=$(echo "$r" | jq 'length'); echo "     get_timeline returns $published events"
r=$(curl "${H[@]}" "$SUPABASE_URL/rest/v1/profiles?select=id")
check "profiles hidden from anon" "$r" 'if type=="array" then length else 0 end' 0
# a write attempt must be rejected by RLS (401/403), not silently accepted
code=$(curl -s -o /dev/null -w '%{http_code}' -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -X POST "$SUPABASE_URL/rest/v1/events" -d '{"slug":"rls-proof-should-fail","year":1,"status":"published"}')
if [[ "$code" == 401 || "$code" == 403 ]]; then echo "ok   anon insert rejected ($code)"; else echo "FAIL anon insert → $code"; fail=1; fi

# a known draft slug, if any is loaded, must resolve to null in get_event_detail
for slug in gutenberg-press ibn-sina-canon; do
  r=$(curl "${H[@]}" -X POST -H "Content-Type: application/json" "$SUPABASE_URL/rest/v1/rpc/get_event_detail" -d "{\"p_slug\":\"$slug\",\"p_locale\":\"en\"}")
  st=$(curl "${H[@]}" "$SUPABASE_URL/rest/v1/events?select=status&slug=eq.$slug" | jq -r '.[0].status // "hidden"')
  if [[ "$st" == "published" ]]; then echo "     $slug is published, skip"; else check "get_event_detail($slug) is null while unpublished" "$r" '. == null' true; fi
done
exit $fail

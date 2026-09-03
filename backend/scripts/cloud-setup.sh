#!/usr/bin/env bash
# First-time cloud setup for Uchkun's Supabase project. Run once, after `supabase login` (interactive).
#   backend/scripts/cloud-setup.sh
# Steps: link the CLI to the project, apply migrations + seed, put the public URL and anon key on Vercel.
# Safe to re-run: link and env writes are idempotent; the db reset is only offered when you confirm.
set -euo pipefail
PROJECT_REF="${SUPABASE_PROJECT_REF:-jnclaqxvfitggyprasxw}"
cd "$(dirname "$0")/../"

echo "→ Linking to project $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo "→ Migrations on the cloud database"
supabase db push

echo
read -r -p "Seed the cloud database now (8 eras, 8 disciplines, 10 sample events)? This resets it. [y/N] " yn
if [[ "$yn" =~ ^[Yy]$ ]]; then
  supabase db reset --linked
fi

echo "→ Public keys"
API_URL="https://${PROJECT_REF}.supabase.co"
ANON_KEY="$(supabase projects api-keys --project-ref "$PROJECT_REF" -o json | python3 -c 'import json,sys; ks=json.load(sys.stdin); print(next(k["api_key"] for k in ks if k["name"] in ("anon","publishable")))')"

echo "→ Vercel environment (production + preview)"
cd ../web
for env in production preview; do
  printf '%s' "$API_URL"  | npx vercel env add NEXT_PUBLIC_SUPABASE_URL "$env" --force >/dev/null
  printf '%s' "$ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "$env" --force >/dev/null
done
npx vercel env ls | grep -E "SUPABASE|REPORT|SITE_URL" || true

echo
echo "Done. Next: push main (or 'npx vercel redeploy' the current production deployment) so the site reads the cloud database."
echo "Then create your admin user: Supabase Studio → Authentication → Users, and run:"
echo "  update profiles set role='admin' where id='<uuid>';"

#!/usr/bin/env bash
# One nightly (or on-demand) run of the content pipeline.
#
#   backend/scripts/pipeline/run.sh              # write the next event
#   backend/scripts/pipeline/run.sh --check      # say what the next event is and stop, no model call
#
# The model here is **Claude Code on the subscription**, not the metered API (ADR-039). ANTHROPIC_API_KEY
# is unset on purpose: if it were present the CLI would bill per token instead of using the plan.
# Locally that is the login already on this machine; in CI it is CLAUDE_CODE_OAUTH_TOKEN, which
# `claude setup-token` prints and which is the same subscription.
#
# Environment:
#   CONTENT_PIPELINE_ENABLED=0    kill switch (ADR-014)
#   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY   which database to read the queue from
#   SUPABASE_DB_URL               where load.sh writes; unset means the local container
#   TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID      optional; without them the run just prints
#   REVIEW_QUEUE_LIMIT            default 10
#   PIPELINE_MODEL                default: whatever the CLI is configured with
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"

# A local run reads its cloud credentials from this gitignored file; CI has them in the environment
# already and has no such file. Exporting here is what lets load.sh see SUPABASE_DB_URL.
if [ -f "$ROOT/backend/.env.pipeline" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT/backend/.env.pipeline"
  set +a
fi

# The plan pays for this run, not a per-token API key (ADR-039). If the key were in the environment the
# CLI would silently prefer it, and the first sign would be an invoice.
unset ANTHROPIC_API_KEY

notify() { "$ROOT/backend/scripts/pipeline/notify.sh" "$1"; }
field() { node -e 'console.log(JSON.parse(process.argv[1])[process.argv[2]])' "$1" "$2"; }

if [ "${CONTENT_PIPELINE_ENABLED:-1}" = "0" ] || [ "${CONTENT_PIPELINE_ENABLED:-1}" = "false" ]; then
  echo "CONTENT_PIPELINE_ENABLED is off; nothing to do."
  exit 0
fi

# Ask what is next before spending a model call: a finished list or a full review queue is a normal
# outcome, not a failure, and it should cost nothing.
set +e
BRIEF="$(node backend/scripts/pipeline/next-event.mjs 2>/dev/null)"
QUEUE_STATE=$?
set -e

case "$QUEUE_STATE" in
  3) MSG="$(field "$BRIEF" message)"; echo "$MSG"; notify "📚 Uchkun: liste bitti. $MSG"; exit 0 ;;
  4) MSG="$(field "$BRIEF" message)"; echo "$MSG"; notify "⏸ Uchkun: $MSG"; exit 0 ;;
  0) : ;;
  *) echo "could not read the queue; see the error above" >&2; notify "⚠️ Uchkun: kuyruk okunamadı."; exit 1 ;;
esac

SLUG="$(field "$BRIEF" slug)"
RANK="$(field "$BRIEF" rank)"

if [ "${1:-}" = "--check" ]; then
  echo "$BRIEF"
  exit 0
fi

echo "writing rank $RANK — $SLUG"
# An `x && y` one-liner here would leave the script on a non-zero status under `set -e` whenever
# PIPELINE_MODEL is unset, which is the normal case.
MODEL_ARGS=()
if [ -n "${PIPELINE_MODEL:-}" ]; then MODEL_ARGS=(--model "$PIPELINE_MODEL"); fi

PROMPT_FILE="backend/scripts/pipeline/prompts/run.md"
# The first run in CI came back with a greeting instead of an event: the model behaved as though it had
# been handed no task at all. Both the argument form and this one work on a laptop, so the difference is
# something about the CI environment rather than the shell. Two changes so that a repeat is diagnosable:
# the prompt goes in on stdin, which is the documented way to feed `claude -p`, and the size the CLI was
# actually given is printed. A line saying "0 bytes" would end the guessing immediately.
echo "claude $(claude --version 2>/dev/null || echo '?'), prompt $(wc -c < "$PROMPT_FILE") bytes" >&2

set +e
OUT="$(claude -p \
  --permission-mode bypassPermissions \
  --output-format json \
  "${MODEL_ARGS[@]}" < "$PROMPT_FILE")"
RUN_STATE=$?
set -e

if [ "$RUN_STATE" != 0 ]; then
  echo "$OUT" >&2
  notify "⚠️ Uchkun: $SLUG yazılamadı (claude çıkış kodu $RUN_STATE). Slot boş kaldı, sonraki koşu yine dener."
  exit "$RUN_STATE"
fi

REPORT="$(printf '%s' "$OUT" | node -e 'const r=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(r.result ?? "")')"
echo "$REPORT"

# Did it actually land? The report is the model's word; the database is the fact.
STATUS="$(node -e '
import("./backend/scripts/pipeline/env.mjs").then(async (m) => {
  const rows = await m.selectRows(`events?slug=eq.${process.argv[1]}&select=status`);
  console.log(rows[0]?.status ?? "missing");
})' "$SLUG")"

if [ "$STATUS" = "review" ]; then
  notify "✅ Uchkun: yeni olay incelemede — $SLUG (sıra $RANK)

$REPORT"
else
  notify "⚠️ Uchkun: $SLUG koşusu bitti ama veritabanında durumu '$STATUS'. Rapor:

$REPORT"
  exit 1
fi

#!/usr/bin/env bash
# Tell the user a run happened. Telegram carries **news, never content** (ADR-036): the event itself is
# read and published in /admin, so nothing here needs to be copied anywhere.
# Without TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID this prints instead of sending, which is the normal
# state of a run started by hand.
set -euo pipefail
MESSAGE="${1:?usage: notify.sh <message>}"

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "--- (no Telegram configured, printing) ---"
  echo "$MESSAGE"
  exit 0
fi

# Telegram caps a message at 4096 characters; a long report is cut rather than dropped.
curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "disable_web_page_preview=true" \
  --data-urlencode "text=$(printf '%.4000s' "$MESSAGE")" \
  -o /dev/null -w 'telegram: %{http_code}\n'

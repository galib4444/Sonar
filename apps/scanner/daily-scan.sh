#!/bin/bash
# daily-scan.sh — runs every morning via launchd
# Scans ATS boards, sends fresh job highlights to Telegram

set -e
cd "$(dirname "$0")"

LOG="$HOME/Library/Logs/sonar-daily.log"
exec >> "$LOG" 2>&1

echo ""
echo "=== $(date '+%Y-%m-%d %H:%M') daily scan starting ==="

# Resolve node (nvm installs it in a non-login path)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
# fallback: homebrew / system node
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

NODE=$(command -v node)
if [ -z "$NODE" ]; then
  echo "ERROR: node not found"
  node daily-scan.sh --notify-error "daily scan failed: node not found"
  exit 1
fi

# Run zero-token scan
OUTPUT=$("$NODE" scan.mjs 2>&1)
echo "$OUTPUT"

# Extract new offers count
COUNT=$(echo "$OUTPUT" | grep -oE 'New offers added:\s+[0-9]+' | grep -oE '[0-9]+' | head -1)
COUNT="${COUNT:-0}"

# Extract top 5 new jobs (lines starting with  +)
TOP=$(echo "$OUTPUT" | grep -E '^\s+\+' | head -5 | sed 's/^\s*+\s*/• /')

if [ "$COUNT" -gt 0 ]; then
  # Push new jobs to Google Sheets
  echo "Pushing $COUNT new jobs to Google Sheets..."
  "$NODE" push-to-sheets.mjs --since 1 && echo "Sheet updated." || echo "Sheet push failed (non-fatal)."

  # Send summary + top picks to Telegram
  MSG="🔍 *Daily scan complete* — $COUNT new job$([ "$COUNT" != '1' ] && echo 's' || echo '') found today.

*Top picks:*
$TOP

Reply *jobs* to see all, or open Claude Code to evaluate."

  "$NODE" notify.mjs "$MSG"
else
  echo "No new offers today — skipping notifications."
fi

echo "=== done ==="

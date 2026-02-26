#!/bin/bash
# Daily Trending Score Update Script
# Run this script daily via cron

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Log file
LOG_FILE="$PROJECT_DIR/logs/trending-update-$(date +%Y%m%d).log"
mkdir -p "$(dirname "$LOG_FILE")"

# Run the update
echo "[$(date)] Starting trending score update..." >> "$LOG_FILE"
npx tsx scripts/daily-trending-update.ts >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "[$(date)] ✅ Update completed successfully" >> "$LOG_FILE"
else
  echo "[$(date)] ❌ Update failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

# Keep only last 30 days of logs
find "$PROJECT_DIR/logs" -name "trending-update-*.log" -mtime +30 -delete 2>/dev/null

exit $EXIT_CODE

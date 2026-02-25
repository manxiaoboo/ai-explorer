#!/bin/bash

# Tooli Data Update Script
# Run this script to update all tool metrics

cd /root/.openclaw/workspace/ai-explorer

echo "=== Tooli Data Update ==="
echo "Started at: $(date)"

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN not set"
  exit 1
fi

echo ""
echo "1. Updating GitHub stars..."
npx tsx scripts/update-github-stars.ts

echo ""
echo "2. Recalculating trending scores..."
npx tsx scripts/calculate-trending.ts

echo ""
echo "3. Discovering new tools (weekly)..."
# Only run on Sundays
if [ "$(date +%u)" -eq 7 ]; then
  npx tsx scripts/discover-github.ts
fi

echo ""
echo "=== Update Complete ==="
echo "Finished at: $(date)"

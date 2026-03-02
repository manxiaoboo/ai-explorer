#!/bin/bash
# Daily full update script for AI Explorer
# Runs all data update tasks in sequence

set -e

cd /root/.openclaw/workspace/ai-explorer

echo "========================================"
echo "AI Explorer - Daily Full Update"
echo "Started at: $(date)"
echo "========================================"

# 1. Update GitHub stars (includes commercial tools)
echo -e "\n[1/2] Updating GitHub stars..."
npx tsx scripts/update-github-stars.ts

# 2. Calculate trending scores
echo -e "\n[2/2] Calculating trending scores..."
npx tsx scripts/calculate-trending.ts

echo -e "\n========================================"
echo "Daily full update completed at: $(date)"
echo "========================================"

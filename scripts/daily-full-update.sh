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
echo -e "\n[1/3] Updating GitHub stars..."
npx tsx scripts/update-github-stars.ts

# 2. Calculate trending scores
echo -e "\n[2/3] Calculating trending scores..."
npx tsx scripts/calculate-trending.ts

# 3. Revalidate cache to refresh pages
echo -e "\n[3/3] Revalidating cache..."
REVALIDATE_SECRET=$(grep REVALIDATE_SECRET .env | cut -d'=' -f2)
curl -X POST "http://localhost:3000/api/revalidate?secret=${REVALIDATE_SECRET}" || echo "Cache revalidation skipped (dev mode)"

echo -e "\n========================================"
echo "Daily full update completed at: $(date)"
echo "========================================"

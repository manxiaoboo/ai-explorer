# Atooli Trending Score Algorithm

## Overview

The trending score (0-100) helps surface the most relevant and popular AI tools. It's calculated from multiple data sources and updated regularly.

## Score Components

| Component | Weight | Description |
|-----------|--------|-------------|
| **GitHub Popularity** | 25% | Stars + 7-day growth rate |
| **Product Hunt** | 20% | Votes + community engagement |
| **HuggingFace** | 15% | Model downloads + likes |
| **User Engagement** | 25% | Website clicks (7d) + saves |
| **Freshness** | 10% | New tool boost (decays over time) |
| **Quality Signals** | 5% | Profile completeness |

## Detailed Calculation

### 1. GitHub Score (25%)

```
baseScore = log10(stars + 1) / log10(5000 + 1) * 100
growthScore = log10(stars_growth_7d + 1) / log10(100 + 1) * 100 * 0.3
trendingBonus = stars_growth_7d > 50 ? 10 : 0

githubScore = min(baseScore + growthScore + trendingBonus, 100)
```

**Benchmarks:**
- 5,000 stars = 100 points
- 100 stars/week growth = 30 points
- Trending repos (+50/week) get +10 bonus

### 2. Product Hunt Score (20%)

```
phScore = log10(votes + 1) / log10(500 + 1) * 100
```

**Benchmark:** 500 votes = 100 points

### 3. HuggingFace Score (15%)

```
downloadScore = log10(downloads + 1) / log10(10000 + 1) * 100 * 0.6
likeScore = log10(likes + 1) / log10(500 + 1) * 100 * 0.4

hfScore = min(downloadScore + likeScore, 100)
```

**Benchmarks:**
- 10,000 downloads = 60 points
- 500 likes = 40 points

### 4. User Engagement Score (25%)

```
clickScore = log10(clicks_7d + 1) / log10(100 + 1) * 100 * 0.7
saveScore = log10(saves + 1) / log10(50 + 1) * 100 * 0.3

engagementScore = min(clickScore + saveScore, 100)
```

**Benchmarks:**
- 100 clicks/week = 70 points
- 50 saves = 30 points

### 5. Freshness Score (10%)

| Age | Score |
|-----|-------|
| ≤ 7 days | 100 |
| ≤ 30 days | 70 |
| ≤ 90 days | 40 |
| ≤ 180 days | 20 |
| > 180 days | 0 |

New tools get a visibility boost that gradually decays.

### 6. Quality Score (5%)

| Factor | Points |
|--------|--------|
| Description >500 chars | 30 |
| Description >300 chars | 20 |
| Description >100 chars | 10 |
| Features (max 4) | 5 each |
| Use cases (max 4) | 5 each |
| Has logo | 15 |
| GitHub or HF link | 15 |

## Final Score

```
trendingScore = 
  githubScore * 0.25 +
  phScore * 0.20 +
  hfScore * 0.15 +
  engagementScore * 0.25 +
  freshnessScore * 0.10 +
  qualityScore * 0.05
```

Result is rounded to 2 decimal places.

## Score Interpretation

| Score | Status | Description |
|-------|--------|-------------|
| 80-100 | 🔥 Hot | Trending, highly popular |
| 60-79 | ⭐ Popular | Well-established, good engagement |
| 40-59 | 📈 Rising | Growing interest |
| 20-39 | 🌱 New/Niche | Recently added or specialized |
| 0-19 | 📋 Listed | Basic presence |

## Update Schedule

| Task | Frequency | Script |
|------|-----------|--------|
| GitHub Stats | Hourly | `update-github-stats.ts` |
| HuggingFace Stats | Twice daily | `update-huggingface-stats.ts` |
| Full Recalculation | Daily 2AM | `daily-trending-update.ts` |
| Weekly Reset | Sundays 3AM | Reset 7-day counters |

## Environment Variables

```bash
# Required for GitHub API (increases rate limit)
GITHUB_TOKEN=ghp_xxx

# Required for Product Hunt
PRODUCT_HUNT_API_KEY=ph_xxx

# Required for Cron API authentication
CRON_SECRET=your-secret-key
```

## Manual Trigger

```bash
# Calculate scores only
npx tsx scripts/calculate-trending-scores.ts

# Update GitHub stats only
npx tsx scripts/update-github-stats.ts

# Full daily update
npx tsx scripts/daily-trending-update.ts

# Via API (with CRON_SECRET)
curl "https://your-site.com/api/cron/calculate-trending?secret=YOUR_CRON_SECRET"
```

## Tips for Tool Owners

1. **Add GitHub repo**: Biggest impact on score (25% weight)
2. **Complete profile**: Add features, use cases, good description
3. **Launch on Product Hunt**: Can significantly boost visibility
4. **HuggingFace integration**: If applicable, add model ID
5. **Fresh content**: New tools get a boost for the first month

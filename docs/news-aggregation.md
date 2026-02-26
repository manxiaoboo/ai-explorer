# AI News Aggregation System - Setup Guide

## Overview
Automated content curation system that:
1. Fetches articles from RSS feeds
2. Uses AI to generate summaries and score quality
3. Identifies mentioned tools and creates internal links
4. Follows curation best practices (not scraping/piracy)

## Database Schema Addition

```sql
-- Add table for tool mentions in news
CREATE TABLE "NewsToolMention" (
  "id" TEXT PRIMARY KEY DEFAULT cuid(),
  "newsId" TEXT NOT NULL REFERENCES "News"("id") ON DELETE CASCADE,
  "toolId" TEXT NOT NULL REFERENCES "Tool"("id") ON DELETE CASCADE,
  "mentions" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("newsId", "toolId")
);

-- Add index for faster lookups
CREATE INDEX "NewsToolMention_newsId_idx" ON "NewsToolMention"("newsId");
CREATE INDEX "NewsToolMention_toolId_idx" ON "NewsToolMention"("toolId");
```

## Curation Best Practices (SEO-Safe)

### ✅ Do:
- Write original summaries (AI-generated)
- Link to original source prominently
- Add "curated by Atooli" attribution
- Include "Read full article" link to source
- Use canonical tags pointing to original
- Keep excerpts under 300 words

### ❌ Don't:
- Copy full article content
- Remove original author attribution
- Hide source link
- Auto-publish without review
- Scrape content without RSS permission

## Content Sources

Recommended RSS feeds to monitor:
- OpenAI Blog
- Anthropic News
- Google AI Blog
- TechCrunch AI
- The Verge AI
- ArXiv AI papers (filtered)

## Implementation

See `scripts/aggregate-news.ts` for full implementation.

## Cron Schedule

Run every 6 hours to check for new content:
```
0 */6 * * *
```

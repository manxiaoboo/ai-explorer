-- Add table for tool mentions in news articles
CREATE TABLE IF NOT EXISTS "NewsToolMention" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "newsId" TEXT NOT NULL REFERENCES "News"("id") ON DELETE CASCADE,
  "toolId" TEXT NOT NULL REFERENCES "Tool"("id") ON DELETE CASCADE,
  "mentions" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("newsId", "toolId")
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS "NewsToolMention_newsId_idx" ON "NewsToolMention"("newsId");
CREATE INDEX IF NOT EXISTS "NewsToolMention_toolId_idx" ON "NewsToolMention"("toolId");

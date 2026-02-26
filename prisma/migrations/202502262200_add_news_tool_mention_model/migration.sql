-- Create NewsToolMention table
CREATE TABLE "NewsToolMention" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "mentions" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsToolMention_pkey" PRIMARY KEY ("id")
);

-- Create unique index
CREATE UNIQUE INDEX "NewsToolMention_newsId_toolId_key" ON "NewsToolMention"("newsId", "toolId");

-- Create indexes
CREATE INDEX "NewsToolMention_newsId_idx" ON "NewsToolMention"("newsId");
CREATE INDEX "NewsToolMention_toolId_idx" ON "NewsToolMention"("toolId");

-- Add foreign key constraints
ALTER TABLE "NewsToolMention" ADD CONSTRAINT "NewsToolMention_newsId_fkey" 
    FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NewsToolMention" ADD CONSTRAINT "NewsToolMention_toolId_fkey" 
    FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

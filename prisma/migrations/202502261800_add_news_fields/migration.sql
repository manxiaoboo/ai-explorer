-- Add source fields to News table
ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "originalUrl" TEXT;
ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "source" TEXT;

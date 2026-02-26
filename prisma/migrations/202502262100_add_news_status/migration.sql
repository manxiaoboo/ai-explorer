-- Add status enum and column to News table
CREATE TYPE "NewsStatus" AS ENUM ('PENDING', 'REVIEWED', 'PUBLISHED', 'REJECTED');

ALTER TABLE "News" ADD COLUMN "status" "NewsStatus" DEFAULT 'PENDING';

-- Create index for status
CREATE INDEX "News_status_idx" ON "News"("status");

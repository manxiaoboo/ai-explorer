const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_Hk9ECo0dPWFc@ep-winter-smoke-aif27rp9.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

const sql = `
CREATE TABLE IF NOT EXISTS "News" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "News_slug_key" ON "News"("slug");
CREATE INDEX IF NOT EXISTS "News_isPublished_idx" ON "News"("isPublished");
CREATE INDEX IF NOT EXISTS "News_publishedAt_idx" ON "News"("publishedAt");
`;

async function main() {
  try {
    await client.connect();
    await client.query(sql);
    console.log('✅ News table created successfully');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();

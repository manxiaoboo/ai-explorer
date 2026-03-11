/**
 * List Pending News
 * 
 * 列出所有待审核的新闻
 */

import { prisma } from "./lib/db";

async function listPendingNews() {
  console.log("📋 Pending News for Review\n");
  console.log("=".repeat(80));
  
  const pendingNews = await prisma.news.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      source: true,
      excerpt: true,
      createdAt: true,
      originalUrl: true,
    },
  });
  
  if (pendingNews.length === 0) {
    console.log("✅ No pending news. All caught up!");
    return;
  }
  
  console.log(`Found ${pendingNews.length} pending news:\n`);
  
  pendingNews.forEach((news, index) => {
    const date = new Date(news.createdAt).toLocaleDateString();
    console.log(`${index + 1}. ${news.title}`);
    console.log(`   Source: ${news.source || "Unknown"}`);
    console.log(`   Date: ${date}`);
    console.log(`   Slug: ${news.slug}`);
    console.log(`   URL: ${news.originalUrl || "N/A"}`);
    console.log(`   Excerpt: ${news.excerpt?.slice(0, 100)}...`);
    console.log();
  });
  
  console.log("=".repeat(80));
  console.log("\nTo approve a news item:");
  console.log(`  npx tsx scripts/news-crawler/approve-news.ts [slug]`);
  console.log("\nTo reject a news item:");
  console.log(`  npx tsx scripts/news-crawler/reject-news.ts [slug]`);
}

listPendingNews()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

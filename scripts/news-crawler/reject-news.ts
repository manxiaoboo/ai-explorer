/**
 * Reject News
 * 
 * 拒绝新闻（审核不通过）
 * Usage: npx tsx scripts/news-crawler/reject-news.ts [slug]
 */

import { prisma } from "./lib/db.js";

async function rejectNews() {
  const slug = process.argv[2];
  
  if (!slug) {
    console.error("❌ Please provide a news slug");
    console.log("Usage: npx tsx scripts/news-crawler/reject-news.ts [slug]");
    process.exit(1);
  }
  
  console.log(`🗑️  Rejecting news: ${slug}\n`);
  
  const news = await prisma.news.findUnique({
    where: { slug },
  });
  
  if (!news) {
    console.error(`❌ News not found: ${slug}`);
    process.exit(1);
  }
  
  await prisma.news.update({
    where: { slug },
    data: {
      status: "REJECTED",
      isPublished: false,
    },
  });
  
  console.log(`🗑️  Rejected: ${news.title}`);
  console.log(`   This news will not be published.`);
}

rejectNews()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

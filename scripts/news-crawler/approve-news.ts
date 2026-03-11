/**
 * Approve News
 * 
 * 审核通过新闻
 * Usage: npx tsx scripts/news-crawler/approve-news.ts [slug]
 */

import { prisma } from "./lib/db.js";

async function approveNews() {
  const slug = process.argv[2];
  
  if (!slug) {
    console.error("❌ Please provide a news slug");
    console.log("Usage: npx tsx scripts/news-crawler/approve-news.ts [slug]");
    process.exit(1);
  }
  
  console.log(`👀 Approving news: ${slug}\n`);
  
  const news = await prisma.news.findUnique({
    where: { slug },
  });
  
  if (!news) {
    console.error(`❌ News not found: ${slug}`);
    process.exit(1);
  }
  
  if (news.status !== "PENDING") {
    console.log(`⚠️  News is already ${news.status}`);
    return;
  }
  
  await prisma.news.update({
    where: { slug },
    data: {
      status: "REVIEWED",
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  
  console.log(`✅ Approved and published: ${news.title}`);
  console.log(`   URL: https://attooli.com/news/${slug}`);
}

approveNews()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

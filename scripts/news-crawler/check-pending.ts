/**
 * Check Pending News
 * 
 * 检查未审核新闻数量，用于决定是否继续抓取
 */

import { prisma } from "./lib/db";

const MAX_PENDING = parseInt(process.env.MAX_PENDING_NEWS || "10");

async function checkPendingNews() {
  console.log("📋 Checking pending news...\n");
  
  const pendingCount = await prisma.news.count({
    where: { status: "PENDING" },
  });
  
  const reviewedCount = await prisma.news.count({
    where: { status: "REVIEWED" },
  });
  
  const publishedCount = await prisma.news.count({
    where: { isPublished: true },
  });
  
  console.log("📊 News Status:");
  console.log(`  ⏳ PENDING (未审核):  ${pendingCount}`);
  console.log(`  👀 REVIEWED (已审):   ${reviewedCount}`);
  console.log(`  ✅ PUBLISHED (已发):  ${publishedCount}`);
  console.log(`  ─────────────────────────`);
  console.log(`  📦 Total: ${pendingCount + reviewedCount + publishedCount}`);
  
  console.log("\n⚙️  Configuration:");
  console.log(`  MAX_PENDING_NEWS: ${MAX_PENDING}`);
  
  if (pendingCount >= MAX_PENDING) {
    console.log("\n⚠️  WARNING: Too many pending news!");
    console.log(`   Current: ${pendingCount}, Max allowed: ${MAX_PENDING}`);
    console.log("   ⛔ Please review pending news before fetching more.");
    process.exit(1);
  } else {
    const remaining = MAX_PENDING - pendingCount;
    console.log(`\n✅ Can fetch ${remaining} more news today.`);
    process.exit(0);
  }
}

checkPendingNews()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

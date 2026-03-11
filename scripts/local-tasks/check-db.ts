/**
 * Database Connection Check
 * 
 * 快速测试本地到远程数据库的连接
 */

import { prisma } from "./lib/db";

async function checkConnection() {
  console.log("🔌 Testing database connection...\n");

  try {
    // 测试连接
    const toolCount = await prisma.tool.count({
      where: { isActive: true },
    });

    const categoryCount = await prisma.category.count();

    const topTool = await prisma.tool.findFirst({
      where: { isActive: true },
      orderBy: { trendingScore: "desc" },
      select: { name: true, trendingScore: true },
    });

    console.log("✅ Connection successful!\n");
    console.log("📊 Database stats:");
    console.log(`  Active tools: ${toolCount}`);
    console.log(`  Categories: ${categoryCount}`);
    console.log(`  Top trending: ${topTool?.name} (${topTool?.trendingScore})`);

    return true;
  } catch (error: any) {
    console.error("\n❌ Connection failed!");
    console.error("\nPossible causes:");
    console.error("  1. DATABASE_URL not set or incorrect");
    console.error("  2. Network issue");
    console.error("  3. Prisma Accelerate API key expired");
    console.error("\nError:", error.message);
    return false;
  }
}

checkConnection()
  .then(async (success) => {
    await prisma.$disconnect();
    process.exit(success ? 0 : 1);
  })
  .catch(async (error) => {
    console.error("\n💥 Unexpected error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

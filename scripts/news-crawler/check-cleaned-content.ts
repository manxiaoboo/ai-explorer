/**
 * 检查清理后的内容质量
 */
import { prisma } from "./lib/db.js";

async function checkCleanedContent() {
  const news = await prisma.news.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { 
      title: true, 
      content: true,
      source: true,
    }
  });
  
  console.log("🔍 Cleaned Content Check\n");
  
  for (const n of news) {
    console.log("=".repeat(80));
    console.log(`📰 ${n.title}`);
    console.log(`📡 Source: ${n.source}`);
    console.log("-".repeat(80));
    
    const content = n.content || "";
    console.log("\n📄 CONTENT START (500 chars):");
    console.log(content.slice(0, 500));
    console.log("\n...");
    console.log("\n📄 CONTENT END (500 chars):");
    console.log(content.slice(-500));
    console.log("\n");
  }
  
  await prisma.$disconnect();
}

checkCleanedContent();

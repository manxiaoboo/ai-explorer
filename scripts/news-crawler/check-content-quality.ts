/**
 * 检查内容质量 - 查看是否有无关信息
 */
import { prisma } from "./lib/db.js";

async function checkContentQuality() {
  const news = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 5,
    select: { 
      title: true, 
      content: true,
      source: true,
    }
  });
  
  console.log("🔍 Content Quality Check\n");
  
  for (const n of news) {
    console.log("=".repeat(80));
    console.log(`📰 ${n.title}`);
    console.log(`📡 Source: ${n.source}`);
    console.log("-".repeat(80));
    
    // 显示内容的开头和结尾
    const content = n.content || "";
    console.log("\n📄 CONTENT START:");
    console.log(content.slice(0, 500));
    console.log("\n...");
    console.log("\n📄 CONTENT END:");
    console.log(content.slice(-500));
    console.log("\n");
  }
  
  await prisma.$disconnect();
}

checkContentQuality();

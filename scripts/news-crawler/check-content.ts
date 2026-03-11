/**
 * 检查新闻内容完整性
 */
import { prisma } from "./lib/db.js";

async function checkContent() {
  console.log("🔍 Checking content completeness...\n");
  
  const news = await prisma.news.findMany({ 
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" }, 
    take: 5,
    select: { 
      title: true, 
      content: true, 
      contentHtml: true, 
      source: true,
      originalUrl: true
    }
  });
  
  for (const n of news) {
    console.log("=".repeat(60));
    console.log("📰", n.title);
    console.log("🔗", n.originalUrl);
    console.log("📡 Source:", n.source);
    console.log("-".repeat(60));
    console.log("📄 content length:", n.content?.length || 0, "chars");
    console.log("🌐 contentHtml length:", n.contentHtml?.length || 0, "chars");
    console.log("\n📝 Content Preview (first 300 chars):");
    console.log(n.content?.slice(0, 300) || "EMPTY");
    console.log("\n🌐 HTML Preview (first 300 chars):");
    console.log(n.contentHtml?.slice(0, 300) || "EMPTY");
    console.log("\n");
  }
  
  await prisma.$disconnect();
}

checkContent();

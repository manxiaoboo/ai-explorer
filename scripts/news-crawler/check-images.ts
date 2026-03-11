/**
 * 检查新闻图片抓取情况
 */
import { prisma } from "./lib/db.js";

async function checkImages() {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { 
      title: true, 
      coverImage: true, 
      source: true,
      contentHtml: true,
    }
  });
  
  console.log("📸 News Images Check\n");
  console.log("=".repeat(70));
  
  for (const n of news) {
    console.log(`\n📰 ${n.title.slice(0, 50)}...`);
    console.log(`   Source: ${n.source}`);
    console.log(`   coverImage: ${n.coverImage || "❌ NULL"}`);
    
    // 从 contentHtml 中找第一个图片
    if (n.contentHtml) {
      const imgMatch = n.contentHtml.match(/<img[^>]+src=["']([^"']+)["']/);
      if (imgMatch) {
        console.log(`   🖼️  First image in content: ${imgMatch[1].slice(0, 60)}...`);
      } else {
        console.log(`   🖼️  No image found in content`);
      }
    }
  }
  
  // 统计
  const withImage = news.filter(n => n.coverImage).length;
  console.log(`\n${"=".repeat(70)}`);
  console.log(`📊 Stats: ${withImage}/${news.length} have coverImage`);
  
  await prisma.$disconnect();
}

checkImages();

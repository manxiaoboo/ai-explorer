/**
 * 展示新闻及图片
 */
import { prisma } from "./lib/db.js";

async function showNewsWithImages() {
  const news = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 8,
    select: { 
      title: true, 
      coverImage: true,
      source: true,
      slug: true,
      excerpt: true,
    }
  });
  
  console.log("📰 Today's Published News with Images\n");
  console.log("=".repeat(80));
  
  for (const n of news) {
    console.log(`\n📌 ${n.title}`);
    console.log(`   🏷️  ${n.source}`);
    console.log(`   🖼️  ${n.coverImage}`);
    console.log(`   🔗 /news/${n.slug}`);
    console.log(`   📝 ${(n.excerpt || '').slice(0, 100)}...`);
    console.log("-".repeat(80));
  }
  
  // 统计
  const allPublished = await prisma.news.count({ where: { status: "PUBLISHED" }});
  const withImages = await prisma.news.count({ 
    where: { status: "PUBLISHED", coverImage: { not: null }}
  });
  
  console.log(`\n📊 Total Published: ${allPublished}, With Images: ${withImages}`);
  
  await prisma.$disconnect();
}

showNewsWithImages();

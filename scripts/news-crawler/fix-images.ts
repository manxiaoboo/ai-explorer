/**
 * 为已发布新闻补充图片
 */
import { prisma } from "./lib/db.js";

async function fixImages() {
  console.log("🖼️  Fixing missing cover images...\n");
  
  const newsWithoutImages = await prisma.news.findMany({
    where: { 
      coverImage: null,
      contentHtml: { not: null }
    },
    select: { 
      id: true,
      title: true, 
      contentHtml: true,
      source: true,
    }
  });
  
  console.log(`Found ${newsWithoutImages.length} news without coverImage`);
  
  let fixed = 0;
  
  for (const news of newsWithoutImages) {
    if (!news.contentHtml) continue;
    
    // 从 contentHtml 提取第一张图片
    const imgMatch = news.contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      const imageUrl = imgMatch[1];
      console.log(`\n📰 ${news.title.slice(0, 50)}...`);
      console.log(`   🖼️  Found: ${imageUrl.slice(0, 60)}...`);
      
      await prisma.news.update({
        where: { id: news.id },
        data: { coverImage: imageUrl }
      });
      
      console.log(`   ✅ Fixed`);
      fixed++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} news articles`);
  await prisma.$disconnect();
}

fixImages();

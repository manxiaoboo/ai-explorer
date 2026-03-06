import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BRAND_NAME = 'attooli';

async function main() {
  console.log(`🔧 更新品牌名为: ${BRAND_NAME}\n`);

  // 获取所有工具
  const tools = await prisma.tool.findMany({
    include: { category: true },
  });

  console.log(`找到 ${tools.length} 个工具，开始更新...\n`);

  let count = 0;
  for (const tool of tools) {
    const name = tool.name;
    const category = tool.category?.name || 'AI Tool';
    const tagline = tool.tagline || '';
    const description = tool.description || '';
    
    // 生成新的 SEO meta
    const suffix = ` | ${BRAND_NAME}`;
    const maxTitleLen = 60 - suffix.length;
    
    let metaTitle = `${name} - ${category} AI Tool${suffix}`;
    if (metaTitle.length > 60) {
      metaTitle = `${name.substring(0, 50)}... - AI Tool${suffix}`;
    }
    
    const baseContent = tagline || description || `${name} is a ${category.toLowerCase()} AI tool.`;
    const cleanContent = baseContent.replace(/\s+/g, ' ').trim();
    
    const descSuffix = ` Discover features, pricing, and alternatives on ${BRAND_NAME}.`;
    const maxDescLen = 160 - descSuffix.length;
    
    let metaDescription = cleanContent.length > maxDescLen
      ? cleanContent.substring(0, maxDescLen - 3) + '...' + descSuffix
      : cleanContent + descSuffix;
    
    if (metaDescription.length > 160) {
      metaDescription = metaDescription.substring(0, 157) + '...';
    }
    
    await prisma.tool.update({
      where: { id: tool.id },
      data: { metaTitle, metaDescription },
    });
    
    count++;
    if (count % 50 === 0) {
      console.log(`进度: ${count}/${tools.length}`);
    }
  }

  // 更新新闻
  const newsArticles = await prisma.news.findMany();
  console.log(`\n找到 ${newsArticles.length} 篇新闻，开始更新...`);

  for (const article of newsArticles) {
    const suffix = ` | ${BRAND_NAME}`;
    const descSuffix = ` | Latest AI news and updates on ${BRAND_NAME}.`;
    
    const baseTitle = article.title;
    const metaTitle = baseTitle.length > 55 
      ? baseTitle.substring(0, 52) + '...' + suffix
      : baseTitle + suffix;
    
    const excerpt = article.excerpt || '';
    const metaDescription = excerpt.length > 155
      ? excerpt.substring(0, 152) + '...' + descSuffix
      : excerpt + descSuffix;
    
    await prisma.news.update({
      where: { id: article.id },
      data: { metaTitle, metaDescription },
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ 品牌名更新完成！');
  console.log(`   新品牌名: ${BRAND_NAME}`);
  console.log(`   官方邮箱: billman@${BRAND_NAME}.com`);
  console.log(`   更新工具: ${count} 个`);
  console.log(`   更新新闻: ${newsArticles.length} 篇`);
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

main().catch(console.error);

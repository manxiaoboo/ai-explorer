import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OLD_NAME = 'AI Explorer';
const NEW_NAME = 'attooli';

async function main() {
  console.log(`🔧 品牌名更新: ${OLD_NAME} → ${NEW_NAME}\n`);

  // 1. 更新所有工具的 SEO meta
  console.log('1️⃣ 更新工具 SEO meta...');
  const tools = await prisma.tool.findMany({
    where: {
      OR: [
        { metaTitle: { contains: OLD_NAME } },
        { metaDescription: { contains: OLD_NAME } },
      ],
    },
  });

  let updatedTools = 0;
  for (const tool of tools) {
    const metaTitle = tool.metaTitle?.replace(OLD_NAME, NEW_NAME) || null;
    const metaDescription = tool.metaDescription?.replace(OLD_NAME, NEW_NAME) || null;
    
    await prisma.tool.update({
      where: { id: tool.id },
      data: { metaTitle, metaDescription },
    });
    updatedTools++;
  }
  console.log(`   ✅ 更新了 ${updatedTools} 个工具\n`);

  // 2. 更新所有新闻的 SEO meta
  console.log('2️⃣ 更新新闻 SEO meta...');
  const news = await prisma.news.findMany({
    where: {
      OR: [
        { metaTitle: { contains: OLD_NAME } },
        { metaDescription: { contains: OLD_NAME } },
      ],
    },
  });

  let updatedNews = 0;
  for (const article of news) {
    const metaTitle = article.metaTitle?.replace(OLD_NAME, NEW_NAME) || null;
    const metaDescription = article.metaDescription?.replace(OLD_NAME, NEW_NAME) || null;
    
    await prisma.news.update({
      where: { id: article.id },
      data: { metaTitle, metaDescription },
    });
    updatedNews++;
  }
  console.log(`   ✅ 更新了 ${updatedNews} 篇新闻\n`);

  // 3. 重新生成所有工具的 SEO（确保格式统一）
  console.log('3️⃣ 重新生成工具 SEO meta...');
  const allTools = await prisma.tool.findMany({
    include: { category: true },
  });

  for (const tool of allTools) {
    const name = tool.name;
    const category = tool.category?.name || 'AI Tool';
    const tagline = tool.tagline || '';
    const description = tool.description || '';
    
    const suffix = ` | ${NEW_NAME}`;
    const maxTitleLen = 60 - suffix.length;
    
    let metaTitle = `${name} - ${category} AI Tool${suffix}`;
    if (metaTitle.length > 60) {
      metaTitle = `${name.substring(0, 50)}... - AI Tool${suffix}`;
    }
    
    const baseContent = tagline || description || `${name} is a ${category.toLowerCase()} AI tool.`;
    const cleanContent = baseContent.replace(/\s+/g, ' ').trim();
    
    const descSuffix = ` Discover features, pricing, and alternatives on ${NEW_NAME}.`;
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
  }
  console.log(`   ✅ 重新生成了 ${allTools.length} 个工具的 SEO\n`);

  console.log('='.repeat(50));
  console.log('✅ 品牌名更新完成！');
  console.log(`   新品牌名: ${NEW_NAME}`);
  console.log(`   官方邮箱: billman@${NEW_NAME}.com`);
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

main().catch(console.error);

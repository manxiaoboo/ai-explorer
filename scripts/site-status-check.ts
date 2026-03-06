import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 AI Explorer 网站状态评估\n');
  console.log('='.repeat(60));

  // 1. 内容统计
  console.log('\n📊 内容统计');
  console.log('-'.repeat(40));
  
  const toolCount = await prisma.tool.count();
  const categoryCount = await prisma.category.count();
  const newsCount = await prisma.news.count();
  const publishedNews = await prisma.news.count({ where: { isPublished: true } });
  
  console.log(`工具数量: ${toolCount}`);
  console.log(`分类数量: ${categoryCount}`);
  console.log(`新闻总数: ${newsCount}`);
  console.log(`已发布新闻: ${publishedNews}`);

  // 2. SEO 完整性检查
  console.log('\n📈 SEO 完整性');
  console.log('-'.repeat(40));
  
  const toolsWithMeta = await prisma.tool.count({
    where: { AND: [{ metaTitle: { not: null } }, { metaDescription: { not: null } }] }
  });
  const toolsWithoutMeta = await prisma.tool.count({
    where: { OR: [{ metaTitle: null }, { metaDescription: null }] }
  });
  
  const newsWithMeta = await prisma.news.count({
    where: { AND: [{ metaTitle: { not: null } }, { metaDescription: { not: null } }] }
  });
  
  console.log(`工具页 SEO 完整: ${toolsWithMeta}/${toolCount} (${Math.round(toolsWithMeta/toolCount*100)}%)`);
  console.log(`工具页 SEO 缺失: ${toolsWithoutMeta}`);
  console.log(`新闻页 SEO 完整: ${newsWithMeta}/${newsCount} (100%)`);

  // 3. 定价数据完整性
  console.log('\n💰 定价数据');
  console.log('-'.repeat(40));
  
  const toolsWithPricing = await prisma.tool.count({
    where: { pricingPlans: { some: {} } }
  });
  
  console.log(`有定价数据的工具: ${toolsWithPricing}/${toolCount} (${Math.round(toolsWithPricing/toolCount*100)}%)`);

  // 4. Logo 完整性
  console.log('\n🖼️ Logo 状态');
  console.log('-'.repeat(40));
  
  const toolsWithLogo = await prisma.tool.count({
    where: { logo: { not: null } }
  });
  
  console.log(`有 Logo 的工具: ${toolsWithLogo}/${toolCount} (${Math.round(toolsWithLogo/toolCount*100)}%)`);

  // 5. 新闻时效性
  console.log('\n📰 新闻时效性');
  console.log('-'.repeat(40));
  
  const recentNews = await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });
  
  console.log('最近发布:');
  for (const news of recentNews) {
    const date = news.publishedAt?.toLocaleDateString('zh-CN') || '未发布';
    console.log(`  - ${news.title.substring(0, 40)}... (${date})`);
  }

  // 6. 综合评估
  console.log('\n' + '='.repeat(60));
  console.log('📋 绑定域名就绪度评估');
  console.log('='.repeat(60));

  const scores = {
    content: Math.min(toolCount / 100, 10) * 0.5 + Math.min(newsCount / 10, 10) * 0.5,
    seo: (toolsWithMeta / toolCount) * 10,
    pricing: (toolsWithPricing / toolCount) * 10,
    branding: (toolsWithLogo / toolCount) * 10,
  };

  const totalScore = (scores.content + scores.seo + scores.pricing + scores.branding) / 4;

  console.log(`\n内容丰富度: ${scores.content.toFixed(1)}/10 ${scores.content >= 7 ? '✅' : scores.content >= 5 ? '⚠️' : '❌'}`);
  console.log(`SEO 完整度: ${scores.seo.toFixed(1)}/10 ${scores.seo >= 7 ? '✅' : scores.seo >= 5 ? '⚠️' : '❌'}`);
  console.log(`定价数据度: ${scores.pricing.toFixed(1)}/10 ${scores.pricing >= 7 ? '✅' : scores.pricing >= 5 ? '⚠️' : '❌'}`);
  console.log(`品牌完整度: ${scores.branding.toFixed(1)}/10 ${scores.branding >= 7 ? '✅' : scores.branding >= 5 ? '⚠️' : '❌'}`);
  console.log(`\n综合评分: ${totalScore.toFixed(1)}/10`);

  console.log('\n' + '='.repeat(60));
  if (totalScore >= 7) {
    console.log('✅ 建议: 已具备绑定域名的条件');
  } else if (totalScore >= 5) {
    console.log('⚠️ 建议: 可以绑定域名，但建议先优化以下方面:');
    if (scores.content < 7) console.log('   - 增加新闻内容数量');
    if (scores.seo < 7) console.log('   - 补充缺失的 SEO meta 信息');
    if (scores.pricing < 7) console.log('   - 完善工具定价数据');
  } else {
    console.log('❌ 建议: 暂不绑定域名，先完善网站内容');
  }
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main().catch(console.error);

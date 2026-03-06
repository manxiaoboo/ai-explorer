import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate SEO meta information
function generateSEOMeta(title: string, excerpt: string): {
  metaTitle: string;
  metaDescription: string;
} {
  const suffix = ' | AI Explorer';
  const maxTitleLen = 60 - suffix.length;
  const metaTitle = title.length > maxTitleLen 
    ? title.substring(0, maxTitleLen - 3) + '...' + suffix
    : title + suffix;
  
  const descSuffix = ' | Latest AI news and updates on AI Explorer.';
  const maxDescLen = 160 - descSuffix.length;
  const cleanExcerpt = excerpt.replace(/\s+/g, ' ').trim();
  const metaDescription = cleanExcerpt.length > maxDescLen
    ? cleanExcerpt.substring(0, maxDescLen - 3) + '...' + descSuffix
    : cleanExcerpt + descSuffix;
  
  return { metaTitle, metaDescription };
}

// List all news with status
async function listNews() {
  const allNews = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  console.log(`\n📊 Total articles: ${allNews.length}\n`);
  
  for (const news of allNews) {
    const status = news.isPublished ? '✅ PUBLISHED' : '📝 DRAFT';
    const seoStatus = news.metaTitle ? '📈 SEO OK' : '❌ NO SEO';
    console.log(`${status} ${seoStatus} | ${news.title}`);
    console.log(`    Slug: ${news.slug}`);
    if (news.metaTitle) {
      console.log(`    Meta: ${news.metaTitle.substring(0, 50)}...`);
    }
    console.log('');
  }
}

// Fix SEO for all articles
async function fixSEO() {
  const newsWithoutMeta = await prisma.news.findMany({
    where: {
      OR: [
        { metaTitle: null },
        { metaDescription: null },
      ],
    },
  });
  
  console.log(`\n🔧 Fixing SEO for ${newsWithoutMeta.length} articles...\n`);
  
  for (const article of newsWithoutMeta) {
    const seo = generateSEOMeta(article.title, article.excerpt || '');
    
    await prisma.news.update({
      where: { id: article.id },
      data: {
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
      },
    });
    
    console.log(`✅ ${article.title}`);
    console.log(`   Meta: ${seo.metaTitle}`);
  }
}

// Publish all draft articles
async function publishAll() {
  const drafts = await prisma.news.findMany({
    where: { isPublished: false },
  });
  
  console.log(`\n📢 Publishing ${drafts.length} articles...\n`);
  
  for (const article of drafts) {
    // Ensure SEO is set
    const seo = generateSEOMeta(article.title, article.excerpt || '');
    
    await prisma.news.update({
      where: { id: article.id },
      data: {
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: article.metaTitle || seo.metaTitle,
        metaDescription: article.metaDescription || seo.metaDescription,
      },
    });
    
    console.log(`✅ Published: ${article.title}`);
    console.log(`   URL: /news/${article.slug}`);
  }
  
  console.log(`\n✨ Published ${drafts.length} articles`);
}

// Main
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'list':
      await listNews();
      break;
    case 'fix-seo':
      await fixSEO();
      break;
    case 'publish':
      await publishAll();
      break;
    case 'audit':
      await fixSEO();
      await publishAll();
      break;
    default:
      console.log('Usage:');
      console.log('  npx tsx scripts/news-manager.ts list      - List all articles');
      console.log('  npx tsx scripts/news-manager.ts fix-seo   - Fix missing SEO meta');
      console.log('  npx tsx scripts/news-manager.ts publish   - Publish all drafts');
      console.log('  npx tsx scripts/news-manager.ts audit     - Fix SEO + Publish all');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);

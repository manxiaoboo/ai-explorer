import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate SEO meta information
function generateSEOMeta(title: string, excerpt: string): {
  metaTitle: string;
  metaDescription: string;
} {
  // Meta title: 50-60 chars
  const suffix = ' | AI Explorer';
  const maxTitleLen = 60 - suffix.length;
  const metaTitle = title.length > maxTitleLen 
    ? title.substring(0, maxTitleLen - 3) + '...' + suffix
    : title + suffix;
  
  // Meta description: 150-160 chars
  const descSuffix = ' | Latest AI news and updates on AI Explorer.';
  const maxDescLen = 160 - descSuffix.length;
  const metaDescription = excerpt.length > maxDescLen
    ? excerpt.substring(0, maxDescLen - 3) + '...' + descSuffix
    : excerpt + descSuffix;
  
  return { metaTitle, metaDescription };
}

async function main() {
  // Get all news without SEO meta
  const newsWithoutMeta = await prisma.news.findMany({
    where: {
      OR: [
        { metaTitle: null },
        { metaDescription: null },
      ],
    },
  });
  
  console.log(`Found ${newsWithoutMeta.length} articles without SEO meta\n`);
  
  for (const article of newsWithoutMeta) {
    const seo = generateSEOMeta(article.title, article.excerpt || '');
    
    console.log('─'.repeat(60));
    console.log(`Article: ${article.title}`);
    console.log(`\nGenerated SEO Meta:`);
    console.log(`  Title: ${seo.metaTitle}`);
    console.log(`  Description: ${seo.metaDescription.substring(0, 80)}...`);
    
    // Update the article
    await prisma.news.update({
      where: { id: article.id },
      data: {
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
      },
    });
    
    console.log('✅ Updated\n');
  }
  
  // Publish all reviewed articles
  const toPublish = await prisma.news.findMany({
    where: { isPublished: false },
  });
  
  console.log(`\nPublishing ${toPublish.length} articles...\n`);
  
  for (const article of toPublish) {
    await prisma.news.update({
      where: { id: article.id },
      data: {
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    
    console.log(`✅ Published: ${article.title}`);
    console.log(`   URL: /news/${article.slug}`);
  }
  
  console.log('\n✨ Done!');
  await prisma.$disconnect();
}

main().catch(console.error);

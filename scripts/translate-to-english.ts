import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the Chinese article
  const chineseArticle = await prisma.news.findFirst({
    where: {
      title: {
        contains: '亚洲多国监管机构',
      },
    },
  });

  if (!chineseArticle) {
    console.log('Chinese article not found');
    return;
  }

  console.log('Found Chinese article:');
  console.log(`Title: ${chineseArticle.title}`);
  console.log(`Current slug: ${chineseArticle.slug}`);
  console.log('');

  // English translations
  const englishTitle = 'Asian Regulators Jointly Release New Guidelines for AI Financial Applications';
  const englishExcerpt = 'Financial regulators across Asia have jointly released new guidelines for AI applications in finance, aiming to standardize the use of artificial intelligence in the financial sector.';
  const englishContent = `Financial regulators from multiple Asian countries have today jointly released the "Guidelines for Artificial Intelligence Applications in Financial Services," establishing a clear compliance framework for AI use in the banking sector.

The new guidelines cover key areas including algorithm transparency, data privacy protection, and risk management. Financial institutions using AI for credit assessments and investment recommendations must ensure the explainability of their algorithms.

These guidelines are highly consistent with the statement from last week's G20 Finance Ministers meeting and are seen as an important step toward global coordination on AI financial regulation.`;

  const englishMetaTitle = 'Asian Regulators Release AI Finance Guidelines | AI Explorer';
  const englishMetaDescription = 'Asian financial regulators jointly release new AI application guidelines covering algorithm transparency, data privacy, and risk management. | Latest AI industry news and insights.';

  // Update the article with English content
  const updated = await prisma.news.update({
    where: { id: chineseArticle.id },
    data: {
      title: englishTitle,
      excerpt: englishExcerpt,
      content: englishContent,
      metaTitle: englishMetaTitle,
      metaDescription: englishMetaDescription,
      // Keep the same slug or update it
    },
  });

  console.log('✅ Article translated to English');
  console.log('');
  console.log('New Title:', updated.title);
  console.log('New Excerpt:', updated.excerpt.substring(0, 100) + '...');
  console.log('Meta Title:', updated.metaTitle);

  await prisma.$disconnect();
}

main().catch(console.error);

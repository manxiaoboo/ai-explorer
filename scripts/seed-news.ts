import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const newsArticles = [
  {
    title: 'OpenAI Announces GPT-5 Research Preview',
    slug: 'openai-announces-gpt-5-research-preview',
    excerpt: 'OpenAI has announced a research preview of GPT-5, featuring significant improvements in reasoning and multimodal capabilities.',
    content: 'OpenAI has announced a research preview of GPT-5, featuring significant improvements in reasoning and multimodal capabilities. The new model demonstrates enhanced performance across various benchmarks.',
    source: 'OpenAI Blog',
    originalUrl: 'https://openai.com/blog/gpt-5-preview',
    status: 'PUBLISHED',
    isPublished: true,
    metaTitle: 'OpenAI Announces GPT-5 Research Preview | attooli',
    metaDescription: 'OpenAI has announced a research preview of GPT-5, featuring significant improvements in reasoning and multimodal capabilities. | AI industry news',
  },
  {
    title: 'EU AI Act Enforcement Begins Next Week',
    slug: 'eu-ai-act-enforcement-begins-next-week',
    excerpt: 'The European Union\'s AI Act will begin enforcement next week, marking the first comprehensive AI regulation in the world.',
    content: 'The European Union\'s AI Act will begin enforcement next week, marking the first comprehensive AI regulation in the world. Companies operating in the EU must comply with new requirements for high-risk AI systems.',
    source: 'TechCrunch',
    originalUrl: 'https://techcrunch.com/ai-act-enforcement',
    status: 'PUBLISHED',
    isPublished: true,
    metaTitle: 'EU AI Act Enforcement Begins Next Week | attooli',
    metaDescription: 'The European Union\'s AI Act will begin enforcement next week. | AI industry news',
  },
  {
    title: 'Asian Regulators Jointly Release New Guidelines for AI Financial Applications',
    slug: 'asian-regulators-ai-financial-guidelines',
    excerpt: 'Financial regulators across Asia have jointly released new guidelines for AI applications in finance.',
    content: 'Financial regulators from multiple Asian countries have today jointly released the "Guidelines for Artificial Intelligence Applications in Financial Services," establishing a clear compliance framework for AI use in the banking sector.',
    source: 'FinanceAsia Network',
    originalUrl: 'https://example.com/news/asian-regulators',
    status: 'PUBLISHED',
    isPublished: true,
    metaTitle: 'Asian Regulators Release AI Finance Guidelines | attooli',
    metaDescription: 'Asian financial regulators jointly release new AI application guidelines. | AI industry news',
  },
];

async function main() {
  console.log('🚀 添加新闻数据\n');

  for (const article of newsArticles) {
    await prisma.news.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        source: article.source,
        originalUrl: article.originalUrl,
        status: article.status as any,
        isPublished: article.isPublished,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        publishedAt: new Date(),
      },
    });
    console.log(`   ✅ ${article.title}`);
  }

  const count = await prisma.news.count();
  console.log(`\n📊 新闻总数: ${count}`);

  await prisma.$disconnect();
}

main().catch(console.error);

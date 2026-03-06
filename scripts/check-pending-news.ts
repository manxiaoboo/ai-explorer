import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check all news
  const allNews = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  
  console.log(`Total news in database: ${allNews.length}\n`);
  
  console.log('=== Recent News (Last 20) ===\n');
  
  for (const news of allNews) {
    console.log(`ID: ${news.id}`);
    console.log(`Title: ${news.title}`);
    console.log(`Slug: ${news.slug}`);
    console.log(`Excerpt: ${news.excerpt?.substring(0, 100) || 'N/A'}...`);
    console.log(`Source: ${news.source || 'N/A'}`);
    console.log(`Status: ${news.status}`);
    console.log(`Published: ${news.isPublished}`);
    console.log(`Meta Title: ${news.metaTitle || 'NOT SET'}`);
    console.log(`Meta Desc: ${news.metaDescription || 'NOT SET'}`);
    console.log(`Created: ${news.createdAt}`);
    console.log('---');
  }
  
  // Count by status
  const pendingCount = await prisma.news.count({ where: { status: 'PENDING' } });
  const reviewedCount = await prisma.news.count({ where: { status: 'REVIEWED' } });
  const publishedCount = await prisma.news.count({ where: { status: 'PUBLISHED' } });
  const rejectedCount = await prisma.news.count({ where: { status: 'REJECTED' } });
  
  console.log('\n=== Summary ===');
  console.log(`PENDING: ${pendingCount}`);
  console.log(`REVIEWED: ${reviewedCount}`);
  console.log(`PUBLISHED: ${publishedCount}`);
  console.log(`REJECTED: ${rejectedCount}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
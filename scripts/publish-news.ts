import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function publishNews() {
  // 发布 Anthropic 新闻
  const news1 = await prisma.news.update({
    where: { id: 'cmm46r2f30001rnqqcdxmrfv5' },
    data: { 
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });
  console.log(`✅ 已发布: ${news1.title}`);
  
  // 发布 Prada Meta 新闻
  const news2 = await prisma.news.update({
    where: { id: 'cmm46r3c70002rnqqhk141sls' },
    data: { 
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });
  console.log(`✅ 已发布: ${news2.title}`);
  
  console.log('\n=== 发布完成 ===');
  await prisma.$disconnect();
}

publishNews().catch(console.error);

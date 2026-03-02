import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNewsDetails() {
  const news = await prisma.news.findMany({
    where: { 
      OR: [
        { id: 'cmm46r2f30001rnqqcdxmrfv5' },
        { id: 'cmm46r3c70002rnqqhk141sls' }
      ]
    }
  });

  for (const n of news) {
    console.log(`\n=== ${n.title} ===`);
    console.log(`来源: ${n.source}`);
    console.log(`原始URL: ${n.originalUrl}`);
    console.log(`内容长度: ${n.content?.length || 0}`);
    console.log(`原始内容长度: ${n.rawContent?.length || 0}`);
    console.log(`封面图: ${n.coverImage || '无'}`);
    console.log(`\n完整内容:\n${n.content || '空'}`);
    console.log(`\n---\n`);
  }
  
  await prisma.$disconnect();
}

checkNewsDetails();

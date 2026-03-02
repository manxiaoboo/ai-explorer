import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRawContent() {
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
    console.log(`\n原始内容:\n${n.rawContent || '无'}`);
    console.log(`\n---\n`);
  }
  
  await prisma.$disconnect();
}

checkRawContent();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listPending() {
  const pending = await prisma.news.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('=== 待审核新闻 ===\n');
  for (const n of pending) {
    console.log(`ID: ${n.id}`);
    console.log(`标题: ${n.title}`);
    console.log(`---`);
  }
  
  await prisma.$disconnect();
}

listPending();

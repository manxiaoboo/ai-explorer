import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getPendingDetails() {
  const pending = await prisma.news.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  console.log(JSON.stringify(pending, null, 2));
  
  await prisma.$disconnect();
}

getPendingDetails();

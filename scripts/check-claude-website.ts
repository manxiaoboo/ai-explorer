import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkClaude() {
  const claude = await prisma.tool.findFirst({
    where: { name: { contains: 'Claude', mode: 'insensitive' } },
  });
  
  if (!claude) {
    console.log('Claude not found');
    return;
  }
  
  console.log('Claude website:', claude.website);
  
  await prisma.$disconnect();
}

checkClaude().catch(console.error);

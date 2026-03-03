import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSora() {
  const tools = await prisma.tool.findMany({
    where: { 
      OR: [
        { name: { contains: 'Sora', mode: 'insensitive' } },
        { name: { contains: 'sora', mode: 'insensitive' } }
      ]
    },
    select: { name: true, logo: true }
  });
  
  console.log('Sora tools:');
  tools.forEach(t => {
    console.log(`  Name: ${t.name}`);
    console.log(`  Logo: ${t.logo?.substring(0, 100)}...`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkSora();

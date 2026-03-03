import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExternalLogos() {
  const tools = await prisma.tool.findMany({
    where: { 
      AND: [
        { logo: { startsWith: 'http' } },
        { logo: { not: { contains: 'vercel-storage.com' } } }
      ]
    },
    select: { name: true, logo: true }
  });
  
  console.log(`Found ${tools.length} tools with external URLs:\n`);
  tools.forEach(t => {
    console.log(`  ${t.name}: ${t.logo}`);
  });
  
  await prisma.$disconnect();
}

checkExternalLogos();

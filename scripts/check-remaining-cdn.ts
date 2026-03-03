import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRemainingCDNTools() {
  const tools = await prisma.tool.findMany({
    where: { logo: { contains: 'vercel-storage.com' } },
    select: { name: true, logo: true }
  });
  
  console.log(`Found ${tools.length} tools with CDN URLs\n`);
  
  let broken = 0;
  let ok = 0;
  
  for (const tool of tools) {
    try {
      const response = await fetch(tool.logo!, { method: 'HEAD' });
      if (response.status === 403) {
        console.log(`❌ 403: ${tool.name}`);
        console.log(`   ${tool.logo}`);
        broken++;
      } else {
        ok++;
      }
    } catch (error) {
      console.log(`❌ Error: ${tool.name}`);
      broken++;
    }
    await new Promise(r => setTimeout(r, 50));
  }
  
  console.log(`\n========================================`);
  console.log(`Broken: ${broken}, OK: ${ok}`);
  console.log(`========================================`);
  
  await prisma.$disconnect();
}

checkRemainingCDNTools();

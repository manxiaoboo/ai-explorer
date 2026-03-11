import { prisma } from './lib/prisma';

async function main() {
  const tools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { name: true, logo: true }
  });
  
  for (const tool of tools) {
    try {
      const response = await fetch(tool.logo!, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        console.log(`❌ ${tool.name}: ${response.status}`);
        console.log(`   ${tool.logo}`);
      }
    } catch (e) {
      console.log(`❌ ${tool.name}: 访问失败`);
      console.log(`   ${tool.logo}`);
    }
  }
}

main().catch(console.error);

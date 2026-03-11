import { prisma } from './lib/prisma';

async function main() {
  console.log('🔍 检查Logo可访问性...\n');
  
  const tools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { name: true, logo: true },
    orderBy: { createdAt: 'desc' }
  });
  
  let forbiddenCount = 0;
  
  for (const tool of tools) {
    try {
      const response = await fetch(tool.logo!, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        forbiddenCount++;
        console.log(`❌ ${tool.name}: ${response.status} ${response.statusText}`);
      }
    } catch (e: any) {
      forbiddenCount++;
      console.log(`❌ ${tool.name}: ${e.message}`);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`总计: ${tools.length} 个Logo`);
  console.log(`无法访问: ${forbiddenCount} 个`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);

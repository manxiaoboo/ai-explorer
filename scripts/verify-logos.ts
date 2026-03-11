import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('✅ 验证Logo可访问性');
  console.log('='.repeat(70));
  
  const tools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { name: true, logo: true },
    orderBy: { name: 'asc' }
  });
  
  console.log(`\n验证 ${tools.length} 个Logo...\n`);
  
  let accessible = 0;
  let failed = 0;
  
  for (const tool of tools) {
    try {
      const response = await fetch(tool.logo!, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        accessible++;
        console.log(`✅ ${tool.name}`);
      } else {
        failed++;
        console.log(`❌ ${tool.name}: ${response.status}`);
      }
    } catch (e) {
      failed++;
      console.log(`❌ ${tool.name}: 访问失败`);
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`总计: ${tools.length}`);
  console.log(`✅ 可访问: ${accessible}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`${'='.repeat(70)}`);
}

main().catch(console.error);

import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('✅ 验证当前Logo的可访问性');
  console.log('='.repeat(70));
  
  const tools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { name: true, logo: true },
    take: 10
  });
  
  console.log('\n测试前10个工具的Logo:\n');
  
  for (const tool of tools) {
    try {
      const response = await fetch(tool.logo!, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      const source = tool.logo?.includes('clearbit.com') ? 'Clearbit' :
                     tool.logo?.includes('google.com') ? 'Google' :
                     tool.logo?.includes('duckduckgo.com') ? 'DuckDuckGo' :
                     tool.logo?.includes('vercel-storage.com') ? 'Vercel Blob' : 'Other';
      
      if (response.ok) {
        console.log(`✅ ${tool.name} (${source})`);
      } else {
        console.log(`❌ ${tool.name} (${source}): ${response.status}`);
      }
    } catch (e) {
      console.log(`❌ ${tool.name}: 访问失败`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
}

main().catch(console.error);

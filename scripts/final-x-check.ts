import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 最终检查：所有指向X的URL');
  console.log('='.repeat(70));
  
  // 检查所有工具的website和logo
  const allTools = await prisma.tool.findMany({
    select: { id: true, name: true, website: true, logo: true },
    orderBy: { name: 'asc' }
  });
  
  console.log(`数据库共有 ${allTools.length} 个工具\n`);
  
  let websiteXCount = 0;
  let logoXCount = 0;
  
  for (const tool of allTools) {
    const websiteIsX = tool.website?.includes('x.com') || tool.website?.includes('twitter.com');
    const logoIsX = tool.logo?.includes('x.com') || tool.logo?.includes('twitter.com') || 
                    tool.logo?.includes('duckduckgo.com/ip3/x.com');
    
    if (websiteIsX || logoIsX) {
      console.log(`\n⚠️ ${tool.name}`);
      if (websiteIsX) {
        websiteXCount++;
        console.log(`   🔴 Website指向X: ${tool.website}`);
      }
      if (logoIsX) {
        logoXCount++;
        console.log(`   🔴 Logo是X: ${tool.logo?.slice(0, 80)}...`);
      }
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Website指向X的工具: ${websiteXCount} 个`);
  console.log(`Logo是X的工具: ${logoXCount} 个`);
  console.log(`${'='.repeat(70)}`);
}

main().catch(console.error);

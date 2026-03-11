import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 按时间顺序检查所有Logo');
  console.log('='.repeat(70));
  
  const allTools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    orderBy: { createdAt: 'asc' },
    select: { 
      name: true, 
      website: true, 
      logo: true,
      createdAt: true 
    }
  });
  
  console.log(`共 ${allTools.length} 个工具有Logo\n`);
  
  let xCount = 0;
  
  for (let i = 0; i < allTools.length; i++) {
    const tool = allTools[i];
    const logo = tool.logo || '';
    
    // 检查logo URL是否包含X相关
    const isX = 
      logo.includes('x.com') ||
      logo.includes('twitter.com') ||
      logo.includes('twimg.com') ||
      logo.includes('duckduckgo.com/ip3/x.com');
    
    if (isX) {
      xCount++;
      console.log(`\n⚠️  [#${i+1}] ${tool.name}`);
      console.log(`    创建时间: ${tool.createdAt.toISOString()}`);
      console.log(`    官网: ${tool.website}`);
      console.log(`    Logo: ${logo}`);
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`发现 ${xCount} 个工具使用X Logo`);
  console.log(`${'='.repeat(70)}`);
}

main().catch(console.error);

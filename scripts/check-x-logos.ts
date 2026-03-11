import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 检查显示X Logo的工具');
  console.log('='.repeat(70));
  
  // 获取所有有logo的工具
  const toolsWithLogo = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { id: true, name: true, website: true, logo: true }
  });
  
  console.log(`总共有 ${toolsWithLogo.length} 个工具有Logo\n`);
  
  // 检查logo URL是否包含X相关特征
  const xPatternTools = toolsWithLogo.filter(t => 
    t.logo?.includes('x.com') || 
    t.logo?.includes('twitter.com') ||
    t.logo?.includes('abs.twimg.com') ||
    t.website?.includes('x.com')
  );
  
  console.log(`⚠️ 发现 ${xPatternTools.length} 个工具可能使用X Logo:\n`);
  
  xPatternTools.forEach((tool, i) => {
    console.log(`[${i+1}] ${tool.name}`);
    console.log(`    🌐 官网: ${tool.website}`);
    console.log(`    🎨 Logo: ${tool.logo?.slice(0, 80)}...`);
    console.log('');
  });
  
  console.log('='.repeat(70));
}

main().catch(console.error);

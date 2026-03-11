import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(80));
  console.log('✅ 验证Logo修复结果');
  console.log('='.repeat(80));
  
  const tools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { name: true, website: true, logo: true },
    orderBy: { name: 'asc' }
  });
  
  // 检查重复URL
  const urlMap = new Map<string, number>();
  for (const tool of tools) {
    urlMap.set(tool.logo!, (urlMap.get(tool.logo!) || 0) + 1);
  }
  
  const duplicates = Array.from(urlMap.entries()).filter(([_, count]) => count > 1);
  
  console.log(`\n总工具数: ${tools.length}`);
  console.log(`重复Logo组: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log('\n🔴 仍存在的重复Logo:');
    duplicates.forEach(([url, count]) => {
      console.log(`  ${count}个工具共享: ${url.slice(0, 60)}...`);
    });
  } else {
    console.log('\n✅ 所有Logo URL都是唯一的！');
  }
  
  // 检查website指向link.aitoolsdirectory.com的工具
  const redirectTools = tools.filter(t => t.website?.includes('link.aitoolsdirectory.com'));
  console.log(`\n⚠️  仍有 ${redirectTools.length} 个工具使用跳转链接:`);
  redirectTools.forEach(t => console.log(`  - ${t.name}`));
  
  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);

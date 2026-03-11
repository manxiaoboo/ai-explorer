import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 分析指向 X(Twitter) 的URL');
  console.log('='.repeat(70));
  
  // 查找指向X的URL
  const xTools = await prisma.tool.findMany({
    where: {
      OR: [
        { website: { contains: 'x.com' } },
        { website: { contains: 'twitter.com' } }
      ]
    },
    select: {
      id: true,
      name: true,
      website: true,
      description: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`\n📊 统计：共有 ${xTools.length} 个工具指向 X/Twitter\n`);
  
  if (xTools.length === 0) {
    console.log('✅ 没有发现指向X的URL');
    return;
  }
  
  xTools.forEach((tool, i) => {
    console.log(`\n[${i+1}] ${tool.name}`);
    console.log(`    🔗 URL: ${tool.website}`);
    console.log(`    📝 描述: ${tool.description.slice(0, 60)}...`);
    console.log(`    📅 创建时间: ${tool.createdAt.toISOString()}`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('💡 原因分析：');
  console.log('   1. 这些工具可能是通过社交媒体链接抓取的');
  console.log('   2. 原网站可能使用了跳转链接服务');
  console.log('   3. aitoolsdirectory.com 可能将某些链接重定向到了X');
  console.log('='.repeat(70));
}

main().catch(console.error);

import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 检查最早的20个工具的完整信息');
  console.log('='.repeat(70));
  
  const oldest = await prisma.tool.findMany({
    orderBy: { createdAt: 'asc' },
    take: 20,
    select: { 
      name: true, 
      website: true, 
      logo: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  for (let i = 0; i < oldest.length; i++) {
    const t = oldest[i];
    console.log(`\n[${i+1}] ${t.name}`);
    console.log(`   创建: ${t.createdAt.toISOString()}`);
    console.log(`   更新: ${t.updatedAt.toISOString()}`);
    console.log(`   官网: ${t.website || '无'}`);
    console.log(`   Logo: ${t.logo ? t.logo.slice(0, 60) + '...' : '无'}`);
    
    // 检查是否有问题
    const hasIssue = 
      t.website?.includes('x.com') ||
      t.logo?.includes('x.com') ||
      t.logo?.includes('twitter.com') ||
      t.logo?.includes('duckduckgo.com/ip3/x.com');
    
    if (hasIssue) {
      console.log('   ⚠️  ⚠️  ⚠️  有问题！');
    }
  }
}

main().catch(console.error);

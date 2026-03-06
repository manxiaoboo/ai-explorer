import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 设置 Trending 前三名为精选\n');

  // 1. 先重置所有 isFeatured 为 false
  console.log('1️⃣ 重置所有精选标记...');
  const resetResult = await prisma.tool.updateMany({
    where: { isFeatured: true },
    data: { isFeatured: false },
  });
  console.log(`   已重置 ${resetResult.count} 个工具\n`);

  // 2. 获取 Trending 前三名
  console.log('2️⃣ 获取 Trending 前三名...');
  const topTrending = await prisma.tool.findMany({
    where: { isActive: true },
    orderBy: { trendingScore: 'desc' },
    take: 3,
    select: { id: true, name: true, trendingScore: true },
  });

  console.log('   Trending 前三名:');
  for (let i = 0; i < topTrending.length; i++) {
    const tool = topTrending[i];
    console.log(`   ${i + 1}. ${tool.name} (Score: ${tool.trendingScore.toFixed(2)})`);
  }
  console.log('');

  // 3. 设置为精选
  console.log('3️⃣ 设置为精选...');
  for (const tool of topTrending) {
    await prisma.tool.update({
      where: { id: tool.id },
      data: { isFeatured: true },
    });
    console.log(`   ✅ ${tool.name}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('完成！Trending 前三名已设为精选');
  console.log('首页将展示这 3 个工具');
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

main().catch(console.error);

import { prisma } from './lib/prisma';

async function main() {
  const totalTools = await prisma.tool.count();
  const withLogo = await prisma.tool.count({ where: { logo: { not: { equals: null } } } });
  const withoutLogo = await prisma.tool.count({ where: { logo: null } });
  
  const oldestWithoutLogo = await prisma.tool.findMany({
    where: { logo: null },
    orderBy: { createdAt: 'asc' },
    take: 20,
    select: { name: true, website: true, createdAt: true }
  });
  
  console.log('='.repeat(60));
  console.log('📊 Logo 状态统计');
  console.log('='.repeat(60));
  console.log(`总工具数: ${totalTools}`);
  console.log(`已有Logo: ${withLogo}`);
  console.log(`缺少Logo: ${withoutLogo}`);
  console.log(`覆盖率: ${((withLogo/totalTools)*100).toFixed(1)}%`);
  console.log();
  console.log('📋 最早20个缺少Logo的工具:');
  oldestWithoutLogo.forEach((t, i) => {
    console.log(`  ${i+1}. ${t.name} (${t.website || '无官网'})`);
  });
  console.log('='.repeat(60));
}

main().catch(console.error);

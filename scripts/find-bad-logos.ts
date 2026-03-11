#!/usr/bin/env tsx
/**
 * 查找指向错误logo地址的工具
 * 问题: 很多工具的logo指向了 https://icons.duckduckgo.com/ip3/link.aitoolsdirectory.com.ico
 * 这说明抓取时出现了偏差
 */

import { prisma } from './lib/prisma';

const BAD_LOGO_PATTERN = 'link.aitoolsdirectory.com.ico';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 查找有错误Logo URL的工具');
  console.log(`搜索模式: ${BAD_LOGO_PATTERN}`);
  console.log('='.repeat(70));
  console.log();

  // 查询所有logo包含错误地址的工具
  const toolsWithBadLogo = await prisma.tool.findMany({
    where: {
      logo: {
        contains: BAD_LOGO_PATTERN
      }
    },
    select: {
      id: true,
      name: true,
      website: true,
      logo: true,
      slug: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`⚠️  找到 ${toolsWithBadLogo.length} 个工具有错误的Logo地址\n`);

  if (toolsWithBadLogo.length === 0) {
    console.log('✅ 没有发现错误的Logo地址！');
    return;
  }

  // 显示这些工具
  console.log('📋 问题工具列表:\n');
  toolsWithBadLogo.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name}`);
    console.log(`   Slug: ${tool.slug}`);
    console.log(`   Website: ${tool.website}`);
    console.log(`   Logo URL: ${tool.logo?.slice(0, 80)}...`);
    console.log();
  });

  // 导出到文件方便后续处理
  const exportData = toolsWithBadLogo.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    website: t.website,
    badLogoUrl: t.logo
  }));

  console.log('='.repeat(70));
  console.log(`📊 总计: ${toolsWithBadLogo.length} 个工具需要修复`);
  console.log('='.repeat(70));

  // 断开连接
  await prisma.$disconnect();

  return toolsWithBadLogo;
}

main().catch(console.error);

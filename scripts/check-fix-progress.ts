#!/usr/bin/env tsx
/**
 * 检查修复进度
 */

import { prisma } from './lib/prisma';

const BAD_LOGO_PATTERN = 'link.aitoolsdirectory.com.ico';

async function main() {
  console.log('='.repeat(70));
  console.log('📊 修复进度检查');
  console.log('='.repeat(70));
  console.log();

  // 查询还有问题的工具
  const remainingTools = await prisma.tool.findMany({
    where: {
      logo: {
        contains: BAD_LOGO_PATTERN
      }
    },
    select: {
      name: true,
      website: true,
      logo: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`⚠️  还有 ${remainingTools.length} 个工具需要修复\n`);

  if (remainingTools.length > 0) {
    console.log('📋 剩余工具列表:\n');
    remainingTools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   Website: ${tool.website}`);
      console.log();
    });
  } else {
    console.log('✅ 所有工具都已修复！');
  }

  // 统计已经修复的工具
  const totalTools = await prisma.tool.count({
    where: {
      OR: [
        { logo: { contains: 'vercel-storage.com' } },
        { logo: { contains: 'blob.vercel-storage.com' } }
      ]
    }
  });

  console.log(`\n📈 已有 ${totalTools} 个工具使用CDN存储的Logo`);

  await prisma.$disconnect();
}

main().catch(console.error);

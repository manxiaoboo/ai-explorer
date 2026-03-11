#!/usr/bin/env tsx
/**
 * 修复最后两个失败的工具 - 使用手动配置的logo
 */

import { prisma } from './lib/prisma';

const BAD_LOGO_PATTERN = 'link.aitoolsdirectory.com.ico';

// 为失败工具手动设置的真实信息
const MANUAL_FIXES: Record<string, { website: string; logo: string }> = {
  'Groas': {
    website: 'https://groas.io',
    // 使用clearbit logo API
    logo: 'https://logo.clearbit.com/groas.io'
  },
  'MosaChat-AI': {
    website: 'https://www.mosachat.com',
    // 使用clearbit logo API
    logo: 'https://logo.clearbit.com/mosachat.com'
  }
};

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 修复最后两个工具 (手动配置)');
  console.log('='.repeat(70));
  console.log();

  for (const [toolName, fixData] of Object.entries(MANUAL_FIXES)) {
    const tool = await prisma.tool.findFirst({
      where: {
        name: toolName,
        logo: { contains: BAD_LOGO_PATTERN }
      }
    });

    if (!tool) {
      console.log(`⏭️  ${toolName}: 不需要修复或已修复`);
      continue;
    }

    console.log(`📝 ${toolName}`);
    console.log(`   更新Website: ${fixData.website}`);
    console.log(`   更新Logo: ${fixData.logo}`);

    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        website: fixData.website,
        logo: fixData.logo
      }
    });

    console.log(`   ✅ 已更新\n`);
  }

  // 最终验证
  console.log('='.repeat(70));
  console.log('📊 最终验证');
  console.log('='.repeat(70));

  const remainingBadLogos = await prisma.tool.count({
    where: {
      logo: { contains: BAD_LOGO_PATTERN }
    }
  });

  if (remainingBadLogos === 0) {
    console.log('✅ 所有工具的Logo都已修复！');
  } else {
    console.log(`⚠️  还有 ${remainingBadLogos} 个工具需要修复`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);

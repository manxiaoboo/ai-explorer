#!/usr/bin/env tsx
/**
 * 修复所有Logo - 使用外部URL直接存储
 */

import { prisma } from './lib/prisma';
import { MultiSourceLogoFetcher } from './lib/logo-fetcher';

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 修复所有Logo - 使用外部URL');
  console.log('='.repeat(70));
  console.log();

  // 获取所有工具（包括已有Logo的，全部重新抓取）
  const tools = await prisma.tool.findMany({
    where: { website: { not: undefined } },
    select: { id: true, name: true, website: true, logo: true },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`找到 ${tools.length} 个工具\n`);

  const fetcher = new MultiSourceLogoFetcher();
  await fetcher.init();

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    
    console.log(`\n[${i + 1}/${tools.length}] ${tool.name}`);
    console.log(`   官网: ${tool.website}`);
    
    if (!tool.website) {
      skipped++;
      continue;
    }

    // 抓取Logo URL（直接使用外部URL）
    const logoUrl = await fetcher.fetchLogo({ name: tool.name, website: tool.website });

    if (!logoUrl) {
      console.log('   ❌ 未找到Logo');
      failed++;
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    console.log(`   ✅ 找到Logo: ${logoUrl.slice(0, 60)}...`);

    // 更新数据库（直接使用外部URL）
    await prisma.tool.update({
      where: { id: tool.id },
      data: { logo: logoUrl }
    });
    console.log('   ✅ 已更新到数据库');
    success++;

    // 延迟避免被封
    if (i < tools.length - 1) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  await fetcher.close();
  await prisma.$disconnect();

  console.log();
  console.log('='.repeat(70));
  console.log('🎉 Logo修复完成!');
  console.log(`📊 处理: ${tools.length} 个`);
  console.log(`✅ 成功: ${success} 个`);
  console.log(`❌ 失败: ${failed} 个`);
  console.log(`⏭️ 跳过: ${skipped} 个`);
  console.log('='.repeat(70));
}

main().catch(console.error);

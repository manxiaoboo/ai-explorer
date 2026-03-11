#!/usr/bin/env tsx
/**
 * 重新抓取最早20个工具的Logo
 * 用途：更新旧工具的Logo图片
 */

import { prisma } from './lib/prisma';
import { MultiSourceLogoFetcher } from './lib/logo-fetcher';

async function main() {
  console.log('='.repeat(60));
  console.log('🔄 重新抓取最早20个工具的Logo');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();

  // 获取最早的20个工具
  const oldestTools = await prisma.tool.findMany({
    orderBy: { createdAt: 'asc' },
    take: 20,
    select: { id: true, name: true, website: true, logo: true, createdAt: true }
  });

  console.log(`找到 ${oldestTools.length} 个最早的工具\n`);

  const fetcher = new MultiSourceLogoFetcher();
  await fetcher.init();

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < oldestTools.length; i++) {
    const tool = oldestTools[i];
    const hasExistingLogo = tool.logo ? ' (有Logo)' : ' (无Logo)';
    
    console.log(`\n[${i + 1}/${oldestTools.length}] ${tool.name}${hasExistingLogo}`);
    console.log(`  🌐 ${tool.website || '无官网'}`);

    if (!tool.website) {
      console.log('  ⚠️ 跳过：无官网链接');
      skipped++;
      continue;
    }

    // 抓取Logo（自动上传到CDN）
    const cdnUrl = await fetcher.fetchLogo({ name: tool.name, website: tool.website });

    if (!cdnUrl) {
      console.log('  ❌ 未找到Logo');
      failed++;
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    // 更新数据库
    await prisma.tool.update({
      where: { id: tool.id },
      data: { logo: cdnUrl }
    });
    console.log(`  ✅ Logo已更新: ${cdnUrl.slice(0, 50)}...`);
    success++;

    // 延迟
    if (i < oldestTools.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  await fetcher.close();
  await prisma.$disconnect();

  console.log();
  console.log('='.repeat(60));
  console.log('🎉 批量抓取完成!');
  console.log(`处理: ${oldestTools.length} 个`);
  console.log(`✅ 成功: ${success} 个`);
  console.log(`❌ 失败: ${failed} 个`);
  console.log(`⏭️  跳过: ${skipped} 个`);
  console.log('='.repeat(60));
}

main().catch(console.error);

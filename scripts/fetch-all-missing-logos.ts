#!/usr/bin/env tsx
/**
 * 抓取所有缺少Logo的工具
 * 遍历整个数据库，为所有没有Logo的工具抓取（自动上传到CDN）
 */

import { prisma } from './lib/prisma';
import { MultiSourceLogoFetcher } from './lib/logo-fetcher';

async function main() {
  console.log('='.repeat(60));
  console.log('🎨 抓取所有缺少Logo的工具');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();

  // 获取所有缺少Logo的工具
  const allTools = await prisma.tool.findMany({
    where: { logo: null },
    select: { id: true, name: true, website: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const missingLogoTools = allTools.filter(t => t.website !== null);

  console.log(`找到 ${missingLogoTools.length} 个缺少Logo的工具\n`);

  if (missingLogoTools.length === 0) {
    console.log('✅ 所有工具都已有Logo！');
    return;
  }

  const fetcher = new MultiSourceLogoFetcher();
  await fetcher.init();

  let success = 0;
  let failed = 0;

  for (let i = 0; i < missingLogoTools.length; i++) {
    const tool = missingLogoTools[i];
    
    console.log(`\n[${i + 1}/${missingLogoTools.length}] ${tool.name}`);
    console.log(`  🌐 ${tool.website}`);

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
    if (i < missingLogoTools.length - 1) {
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  await fetcher.close();
  await prisma.$disconnect();

  console.log();
  console.log('='.repeat(60));
  console.log('🎉 批量抓取完成!');
  console.log(`处理: ${missingLogoTools.length} 个`);
  console.log(`✅ 成功: ${success} 个`);
  console.log(`❌ 失败: ${failed} 个`);
  console.log(`覆盖率: ${((success / missingLogoTools.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

main().catch(console.error);

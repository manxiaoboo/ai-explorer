#!/usr/bin/env tsx
/**
 * Logo修复报告
 */

import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('📊 Logo修复完成报告');
  console.log('='.repeat(70));
  console.log();

  // 统计各种Logo来源
  const allTools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { name: true, website: true, logo: true }
  });

  const vercelBlob = allTools.filter(t => t.logo?.includes('vercel-storage.com'));
  const duckduckgo = allTools.filter(t => t.logo?.includes('duckduckgo.com'));
  const clearbit = allTools.filter(t => t.logo?.includes('clearbit.com'));
  const other = allTools.filter(t => 
    !t.logo?.includes('vercel-storage.com') && 
    !t.logo?.includes('duckduckgo.com') && 
    !t.logo?.includes('clearbit.com')
  );

  console.log('📈 Logo来源统计:\n');
  console.log(`   Vercel Blob (CDN): ${vercelBlob.length} 个`);
  console.log(`   DuckDuckGo:        ${duckduckgo.length} 个`);
  console.log(`   Clearbit:          ${clearbit.length} 个`);
  console.log(`   其他:              ${other.length} 个`);
  console.log(`   ─────────────────────────`);
  console.log(`   总计:              ${allTools.length} 个`);
  console.log();

  // 检查是否还有错误的logo
  const badLogos = allTools.filter(t => 
    t.logo?.includes('link.aitoolsdirectory.com.ico')
  );

  console.log('='.repeat(70));
  if (badLogos.length === 0) {
    console.log('✅ 所有工具都已修复！没有指向 link.aitoolsdirectory.com 的Logo。');
  } else {
    console.log(`⚠️  还有 ${badLogos.length} 个工具有错误的Logo:`);
    badLogos.forEach(t => console.log(`   - ${t.name}`));
  }
  console.log('='.repeat(70));

  await prisma.$disconnect();
}

main().catch(console.error);

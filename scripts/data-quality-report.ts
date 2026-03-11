#!/usr/bin/env tsx
/**
 * 数据质量报告
 * 用于监控数据库中工具数据的质量
 * 
 * 运行频率：建议每天一次
 * cron: 0 8 * * * (每天早上8点)
 */

import { prisma } from './lib/prisma';
import { isSuspiciousUrl, isPlaceholderLogo } from './lib/validators';

async function generateReport() {
  console.log('='.repeat(70));
  console.log('📊 数据质量报告');
  console.log(`生成时间: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  console.log();

  // 基础统计
  // totalTools 已在上文计算
  const allToolsList = await prisma.tool.findMany({ select: { id: true, logo: true, website: true } });
  const totalTools = allToolsList.length;
  const toolsWithLogo = allToolsList.filter(t => t.logo !== null).length;
  const toolsWithWebsite = allToolsList.filter(t => t.website !== null).length;

  console.log('📈 基础统计:');
  console.log(`   总工具数: ${totalTools}`);
  console.log(`   有Logo: ${toolsWithLogo} (${((toolsWithLogo/totalTools)*100).toFixed(1)}%)`);
  console.log(`   有Website: ${toolsWithWebsite} (${((toolsWithWebsite/totalTools)*100).toFixed(1)}%)`);
  console.log();

  // 问题数据统计
  console.log('🔍 问题数据统计:');

  // 1. 可疑URL
  const suspiciousUrlTools = await prisma.tool.findMany({
    where: {
      OR: [
        { website: { contains: 'link.aitoolsdirectory.com' } },
        { website: { contains: 'r.aitoolsdirectory.com' } },
      ]
    },
    select: { name: true, website: true }
  });

  console.log(`   ❌ 可疑跳转URL: ${suspiciousUrlTools.length} 个`);
  if (suspiciousUrlTools.length > 0) {
    suspiciousUrlTools.slice(0, 5).forEach(t => {
      console.log(`      - ${t.name}: ${t.website}`);
    });
    if (suspiciousUrlTools.length > 5) {
      console.log(`      ... 还有 ${suspiciousUrlTools.length - 5} 个`);
    }
  }

  // 2. 占位符Logo
  const placeholderLogos = await prisma.tool.findMany({
    where: {
      OR: [
        { logo: { contains: 'link.aitoolsdirectory.com.ico' } },
        { logo: { contains: 'aitoolsdirectory.com.ico' } },
      ]
    },
    select: { name: true, logo: true }
  });

  console.log(`   ❌ 占位符Logo: ${placeholderLogos.length} 个`);
  if (placeholderLogos.length > 0) {
    placeholderLogos.slice(0, 5).forEach(t => {
      console.log(`      - ${t.name}`);
    });
    if (placeholderLogos.length > 5) {
      console.log(`      ... 还有 ${placeholderLogos.length - 5} 个`);
    }
  }

  // 3. 缺失Logo
  const missingLogos = allToolsList.filter(t => t.logo === null).length;
  console.log(`   ⚠️  缺失Logo: ${missingLogos} 个`);

  // 4. 缺失Website
  const missingWebsites = allToolsList.filter(t => t.website === null).length;
  console.log(`   ⚠️  缺失Website: ${missingWebsites} 个`);

  console.log();

  // Logo来源分析
  console.log('🎨 Logo来源分析:');
  
  const allLogos = allToolsList.filter(t => t.logo !== null).map(t => ({ logo: t.logo }));

  const vercelBlob = allLogos.filter(t => t.logo?.includes('vercel-storage.com')).length;
  const clearbit = allLogos.filter(t => t.logo?.includes('clearbit.com')).length;
  const duckduckgo = allLogos.filter(t => t.logo?.includes('duckduckgo.com')).length;
  const google = allLogos.filter(t => t.logo?.includes('google.com/s2/favicons')).length;
  const other = allLogos.filter(t => 
    !t.logo?.includes('vercel-storage.com') && 
    !t.logo?.includes('clearbit.com') && 
    !t.logo?.includes('duckduckgo.com') &&
    !t.logo?.includes('google.com/s2/favicons')
  ).length;

  console.log(`   Vercel Blob (CDN): ${vercelBlob} 个`);
  console.log(`   Clearbit: ${clearbit} 个`);
  console.log(`   DuckDuckGo: ${duckduckgo} 个`);
  console.log(`   Google: ${google} 个`);
  console.log(`   其他: ${other} 个`);
  console.log();

  // 健康评分
  const issues = suspiciousUrlTools.length + placeholderLogos.length + Math.floor(missingLogos / 2);
  const healthScore = Math.max(0, 100 - (issues / totalTools) * 100);

  console.log('='.repeat(70));
  console.log('💚 数据健康评分: ' + (healthScore >= 90 ? '优秀' : healthScore >= 70 ? '良好' : '需要改进'));
  console.log(`   得分: ${healthScore.toFixed(1)}/100`);
  console.log('='.repeat(70));

  // 建议
  console.log('\n💡 建议:');
  if (suspiciousUrlTools.length > 0 || placeholderLogos.length > 0) {
    console.log('   1. 运行修复脚本: npx tsx scripts/auto-fix-bad-data.ts');
  }
  if (missingLogos > 10) {
    console.log('   2. 运行Logo抓取: npx tsx scripts/fetch-logos.ts');
  }
  if (healthScore < 90) {
    console.log('   3. 检查抓取脚本是否正常过滤了跳转链接');
  }
  if (healthScore >= 95) {
    console.log('   ✅ 数据质量良好，继续保持！');
  }

  await prisma.$disconnect();
}

generateReport().catch(console.error);

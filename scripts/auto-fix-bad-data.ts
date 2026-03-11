#!/usr/bin/env tsx
/**
 * 自动修复脚本 - 定期运行以检测和修复问题数据
 * 
 * 检测内容：
 * 1. 可疑的跳转链接
 * 2. 占位符 Logo
 * 3. 缺失的 Logo
 * 
 * 运行频率：建议每天一次（在 daily-scrape 之后运行）
 * cron: 0 4 * * * (每天凌晨4点)
 */

import { prisma } from './lib/prisma';
import { RobustLogoFetcher } from './lib/logo-fetcher-robust';
import { isSuspiciousUrl, isPlaceholderLogo, searchRealWebsite } from './lib/validators';

// 限制每次运行的处理数量，避免超时
const MAX_FIX_PER_RUN = 20;

interface FixReport {
  fixedWebsites: Array<{ name: string; old: string; new: string }>;
  fixedLogos: Array<{ name: string; old: string | null; new: string }>;
  failed: Array<{ name: string; reason: string }>;
  skipped: number;
}

const report: FixReport = {
  fixedWebsites: [],
  fixedLogos: [],
  failed: [],
  skipped: 0,
};

/**
 * 修复可疑的 website URL
 */
async function fixWebsiteUrl(tool: { id: string; name: string; website: string | null }): Promise<string | null> {
  console.log(`\n🔧 修复 Website: ${tool.name}`);
  console.log(`   当前: ${tool.website}`);

  // 方法1: 从已知映射查找
  const known = await searchRealWebsite(tool.name);
  if (known) {
    console.log(`   使用已知映射: ${known}`);
    await prisma.tool.update({
      where: { id: tool.id },
      data: { website: known }
    });
    return known;
  }

  console.log(`   ❌ 无法找到已知的真实URL`);
  return null;
}

/**
 * 修复 Logo
 */
async function fixLogo(
  tool: { id: string; name: string; website: string | null },
  logoFetcher: RobustLogoFetcher
): Promise<string | null> {
  console.log(`\n🎨 修复 Logo: ${tool.name}`);
  
  const { logo, website, wasFixed, issues } = await logoFetcher.fetchLogoWithValidation({
    name: tool.name,
    website: tool.website
  });

  if (logo && !isPlaceholderLogo(logo)) {
    await prisma.tool.update({
      where: { id: tool.id },
      data: { logo }
    });
    console.log(`   ✅ 成功: ${logo.slice(0, 60)}...`);
    return logo;
  }

  console.log(`   ❌ 失败: ${issues?.join(', ') || '无法获取'}`);
  return null;
}

/**
 * 主修复流程
 */
async function runAutoFix() {
  console.log('='.repeat(70));
  console.log('🔍 自动数据修复');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  console.log();

  const logoFetcher = new RobustLogoFetcher();
  await logoFetcher.init();

  // 1. 查找有问题的工具
  console.log('📋 阶段1: 扫描问题数据...\n');

  // 1.1 查找可疑URL
  const suspiciousUrlTools = await prisma.tool.findMany({
    where: {
      OR: [
        { website: { contains: 'link.aitoolsdirectory.com' } },
        { website: { contains: 'r.aitoolsdirectory.com' } },
      ]
    },
    select: { id: true, name: true, website: true, logo: true },
    take: MAX_FIX_PER_RUN,
  });

  console.log(`   发现 ${suspiciousUrlTools.length} 个可疑URL`);

  // 1.2 查找占位符Logo
  const placeholderLogoTools = await prisma.tool.findMany({
    where: {
      OR: [
        { logo: { contains: 'link.aitoolsdirectory.com.ico' } },
        { logo: { contains: 'aitoolsdirectory.com.ico' } },
      ]
    },
    select: { id: true, name: true, website: true, logo: true },
    take: MAX_FIX_PER_RUN,
  });

  console.log(`   发现 ${placeholderLogoTools.length} 个占位符Logo`);

  // 1.3 查找缺失Logo但URL正常的工具
  const allToolsWithLogo = await prisma.tool.findMany({
    where: { logo: null },
    select: { id: true, name: true, website: true, logo: true },
  });
  const missingLogoTools = allToolsWithLogo.filter(t => t.website !== null).slice(0, MAX_FIX_PER_RUN);

  console.log(`   发现 ${missingLogoTools.length} 个缺失Logo`);

  // 2. 修复可疑URL
  console.log('\n🔧 阶段2: 修复可疑URL...\n');
  for (const tool of suspiciousUrlTools) {
    const fixed = await fixWebsiteUrl(tool);
    if (fixed) {
      report.fixedWebsites.push({
        name: tool.name,
        old: tool.website!,
        new: fixed
      });
    } else {
      report.failed.push({ name: tool.name, reason: '无法修复URL' });
    }
  }

  // 3. 修复占位符Logo
  console.log('\n🎨 阶段3: 修复占位符Logo...\n');
  for (const tool of placeholderLogoTools) {
    // 先检查URL是否也需要修复
    if (isSuspiciousUrl(tool.website)) {
      const fixedUrl = await fixWebsiteUrl(tool);
      if (fixedUrl) {
        tool.website = fixedUrl;
        report.fixedWebsites.push({
          name: tool.name,
          old: tool.website!,
          new: fixedUrl
        });
      }
    }

    const fixedLogo = await fixLogo(tool, logoFetcher);
    if (fixedLogo) {
      report.fixedLogos.push({
        name: tool.name,
        old: tool.logo,
        new: fixedLogo
      });
    } else {
      report.failed.push({ name: tool.name, reason: '无法修复Logo' });
    }
  }

  // 4. 补充缺失的Logo
  console.log('\n📎 阶段4: 补充缺失的Logo...\n');
  for (const tool of missingLogoTools) {
    // 跳过URL可疑的（应该已经被处理）
    if (isSuspiciousUrl(tool.website)) {
      report.skipped++;
      continue;
    }

    const fixedLogo = await fixLogo(tool, logoFetcher);
    if (fixedLogo) {
      report.fixedLogos.push({
        name: tool.name,
        old: null,
        new: fixedLogo
      });
    }

    // 小延迟避免过载
    await new Promise(r => setTimeout(r, 500));
  }

  await logoFetcher.close();
  await prisma.$disconnect();

  // 5. 生成报告
  console.log();
  console.log('='.repeat(70));
  console.log('📊 修复报告');
  console.log('='.repeat(70));
  console.log(`✅ 修复Website: ${report.fixedWebsites.length} 个`);
  console.log(`✅ 修复Logo: ${report.fixedLogos.length} 个`);
  console.log(`⏭️  跳过: ${report.skipped} 个`);
  console.log(`❌ 失败: ${report.failed.length} 个`);

  if (report.fixedWebsites.length > 0) {
    console.log('\n📝 修复的Website:');
    report.fixedWebsites.forEach(w => {
      console.log(`   • ${w.name}`);
      console.log(`     ${w.old} → ${w.new}`);
    });
  }

  if (report.fixedLogos.length > 0) {
    console.log('\n🎨 修复的Logo:');
    report.fixedLogos.forEach(l => {
      console.log(`   • ${l.name}`);
    });
  }

  if (report.failed.length > 0) {
    console.log('\n⚠️  失败的工具:');
    report.failed.forEach(f => {
      console.log(`   • ${f.name}: ${f.reason}`);
    });
  }

  console.log('='.repeat(70));
}

// 运行
runAutoFix().catch(error => {
  console.error('自动修复出错:', error);
  process.exit(1);
});

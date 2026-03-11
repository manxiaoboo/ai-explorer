#!/usr/bin/env tsx
/**
 * 重试失败的Logo迁移
 * 对于Google/Clearbit下载失败的，直接尝试从官网抓取
 */

import { prisma } from './lib/prisma';
import { MultiSourceLogoFetcher } from './lib/logo-fetcher';
import { isSuspiciousUrl } from './lib/validators';

// 检查URL是否是CDN链接
function isCdnUrl(url: string | null): boolean {
  if (!url) return false;
  return url.includes('vercel-storage.com') || 
         url.includes('blob.vercel-storage.com');
}

// 需要重试的工具列表（手动配置真实官网）
const RETRY_WEBSITES: Record<string, string> = {
  'A2E AI Videos': 'https://a2e.ai',
  'AI Flashcard Maker': 'https://coursebox.ai',
  'AppWizzy': 'https://appwizzy.com',
  'Artta AI': 'https://artta.ai',
  'Atomic Mail': 'https://atomicmail.io',
  'Atoms': 'https://atoms.dev',
  'BASE44': 'https://base44.com',
  'BeautyPlus AI Image Enhancer': 'https://beautyplus.com',
  'CloneViral': 'https://cloneviral.com',
  'Decktopus': 'https://decktopus.com',
  'FocuSee': 'https://focusee.io',
  'Funy AI': 'https://funy.ai',
  'Groas': 'https://groas.io',
  'Klap': 'https://klap.app',
  'Lorka AI': 'https://lorka.ai',
  'MindStudio': 'https://mindstudio.ai',
  'MosaChat-AI': 'https://mosachat.com',
  'Nora AI': 'https://interview.norahq.com',
  'OpusClip': 'https://opus.pro',
  'PhotoCat AI Image Extender': 'https://photocat.com',
  'Stable Commerce': 'https://stablecommerce.ai',
  'Syllaby': 'https://syllaby.io',
  'Taskade': 'https://taskade.com',
  'ThumbnailCreator': 'https://thumbnailcreator.com',
  'Visual Field Test': 'https://visualfieldtest.com',
  'WhatsApp Chatbot': 'https://wadesk.io',
  'chatbox': 'https://chatboxai.app',
  'cherry-studio': 'https://cherry-ai.com',
};

async function retryFailedLogos() {
  console.log('='.repeat(70));
  console.log('🔄 重试失败的Logo迁移');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  console.log();

  // 获取所有不在CDN的logo
  const tools = await prisma.tool.findMany({
    where: {
      logo: { not: null }
    },
    select: { id: true, name: true, website: true, logo: true },
    orderBy: { name: 'asc' }
  });

  const nonCdnTools = tools.filter(t => !isCdnUrl(t.logo));

  console.log(`📊 总共有 ${tools.length} 个工具有Logo`);
  console.log(`   已在CDN: ${tools.length - nonCdnTools.length} 个`);
  console.log(`   需要处理: ${nonCdnTools.length} 个`);
  console.log();

  if (nonCdnTools.length === 0) {
    console.log('✅ 所有Logo都已在CDN！');
    await prisma.$disconnect();
    return;
  }

  // 显示非CDN的logo来源
  const googleTools = nonCdnTools.filter(t => t.logo?.includes('google.com'));
  const clearbitTools = nonCdnTools.filter(t => t.logo?.includes('clearbit.com'));
  const otherTools = nonCdnTools.filter(t => 
    !t.logo?.includes('google.com') && !t.logo?.includes('clearbit.com')
  );

  console.log('📦 非CDN Logo分布:');
  console.log(`   Google: ${googleTools.length} 个`);
  console.log(`   Clearbit: ${clearbitTools.length} 个`);
  console.log(`   其他: ${otherTools.length} 个`);
  console.log();

  const logoFetcher = new MultiSourceLogoFetcher();
  await logoFetcher.init();

  let success = 0;
  let failed = 0;
  let skipped = 0;

  console.log('='.repeat(70));
  console.log('开始处理...');
  console.log('='.repeat(70));

  for (let i = 0; i < nonCdnTools.length; i++) {
    const tool = nonCdnTools[i];
    console.log(`\n[${i + 1}/${nonCdnTools.length}] ${tool.name}`);
    console.log(`   当前Logo: ${tool.logo?.slice(0, 50)}...`);

    // 使用已知官网或当前website
    let targetWebsite = RETRY_WEBSITES[tool.name] || tool.website;

    // 如果website也是可疑的，跳过
    if (isSuspiciousUrl(targetWebsite)) {
      console.log(`   ⏭️ 跳过: 无有效官网地址`);
      skipped++;
      continue;
    }

    console.log(`   使用官网: ${targetWebsite}`);

    // 尝试抓取（会自动上传到CDN）
    const logo = await logoFetcher.fetchLogo({
      name: tool.name,
      website: targetWebsite
    });

    if (logo) {
      // 更新数据库
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo, website: targetWebsite }
      });
      console.log(`   ✅ 成功更新！`);
      success++;
    } else {
      console.log(`   ❌ 失败: 无法获取Logo`);
      failed++;
    }

    // 延迟
    await new Promise(r => setTimeout(r, 500));
  }

  await logoFetcher.close();
  await prisma.$disconnect();

  console.log();
  console.log('='.repeat(70));
  console.log('📊 重试报告');
  console.log('='.repeat(70));
  console.log(`✅ 成功: ${success} 个`);
  console.log(`❌ 失败: ${failed} 个`);
  console.log(`⏭️  跳过: ${skipped} 个`);
  console.log('='.repeat(70));
}

retryFailedLogos().catch(console.error);

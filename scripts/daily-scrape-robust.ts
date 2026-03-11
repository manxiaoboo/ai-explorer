#!/usr/bin/env tsx
/**
 * 健壮的每日抓取脚本 - 集成验证和自动修复
 * 
 * 主要改进：
 * 1. URL验证：检测并修复跳转链接
 * 2. Logo验证：确保抓到的不是占位符
 * 3. 自动修复：发现问题时自动使用备用方案
 * 4. 详细日志：记录所有问题和修复操作
 * 5. 定期自检：运行后自动验证本次抓取的数据
 */

import { prisma } from './lib/prisma';
import { AIToolsDirectoryScraper, ScrapedTool } from './lib/aitools-scraper';
import { RobustLogoFetcher } from './lib/logo-fetcher-robust';
import { isSuspiciousUrl, isPlaceholderLogo } from './lib/validators';
import { PricingTier } from '@prisma/client';

// 每日目标
const DAILY_TARGET = 30;

// 分类映射表
const CATEGORY_MAPPING: Record<string, string> = {
  'AI Agents': 'ai-agents',
  'Automation': 'ai-agents',
  'NoCode': 'ai-agents',
  'No Code': 'ai-agents',
  'Video Generation': 'video-creation',
  'Generative Video': 'video-creation',
  'Text-to-Video': 'video-creation',
  'Video Editing': 'video-creation',
  'Lifetime Deal': 'video-creation',
  'Generative Art': 'image-design',
  'Image Editing': 'image-design',
  'Design': 'image-design',
  'Image': 'image-design',
  'Editing': 'image-design',
  'Chat': 'chat-assistants',
  'Chatbot': 'chat-assistants',
  'Assistant': 'chat-assistants',
  'Audio': 'chat-assistants',
  'Music': 'chat-assistants',
  'Text-to-Voice': 'chat-assistants',
  'Coding': 'developer-tools',
  'Code': 'developer-tools',
  'Developer Tools': 'developer-tools',
  'Data': 'developer-tools',
  'Gaming': 'developer-tools',
  'Copywriting': 'content-creation',
  'Writing': 'content-creation',
  'Content': 'content-creation',
  'Blog': 'content-creation',
  'Social Media': 'content-creation',
  'Marketing': 'content-creation',
  'SEO': 'content-creation',
  'Advertising': 'content-creation',
  'Podcasting': 'content-creation',
  'Marke': 'content-creation',
  'Productivity': 'productivity-business',
  'Business Intelligence': 'productivity-business',
  'Presentation Maker': 'productivity-business',
  'Education': 'education-learning',
  'Recruitment': 'education-learning',
  'AI Detection': 'search-research',
  'Search': 'search-research',
  'Health Tech': 'specialized-industries',
  'Special Offers': 'special-offers',
};

// 统计信息
interface ScrapingStats {
  totalScraped: number;
  totalAdded: number;
  totalSkipped: number;
  totalFailed: number;
  urlFixed: number;
  logoFixed: number;
  suspiciousBlocked: number;
  validationErrors: Array<{ name: string; issues: string[] }>;
}

const stats: ScrapingStats = {
  totalScraped: 0,
  totalAdded: 0,
  totalSkipped: 0,
  totalFailed: 0,
  urlFixed: 0,
  logoFixed: 0,
  suspiciousBlocked: 0,
  validationErrors: [],
};

function mapPricingTier(pricing: string): PricingTier {
  const normalized = pricing.toLowerCase().trim();
  if (normalized.includes('free') && !normalized.includes('paid')) return PricingTier.FREE;
  if (normalized.includes('freemium') || (normalized.includes('free') && normalized.includes('paid'))) return PricingTier.FREEMIUM;
  if (normalized.includes('open source')) return PricingTier.OPEN_SOURCE;
  if (normalized.includes('enterprise') || normalized.includes('contact')) return PricingTier.ENTERPRISE;
  return PricingTier.PAID;
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function autoCategorize(name: string, description: string, originalCategory: string): string {
  const text = (name + ' ' + description).toLowerCase();
  
  const keywordMap: Record<string, string> = {
    'video': 'video-creation',
    'clip': 'video-creation',
    'reel': 'video-creation',
    'footage': 'video-creation',
    'film': 'video-creation',
    'image': 'image-design',
    'photo': 'image-design',
    'design': 'image-design',
    'art': 'image-design',
    'draw': 'image-design',
    'sketch': 'image-design',
    'thumbnail': 'image-design',
    'logo': 'image-design',
    'code': 'developer-tools',
    'coding': 'developer-tools',
    'developer': 'developer-tools',
    'programming': 'developer-tools',
    'api': 'developer-tools',
    'database': 'developer-tools',
    'github': 'developer-tools',
    'git': 'developer-tools',
    'agent': 'ai-agents',
    'automation': 'ai-agents',
    'automate': 'ai-agents',
    'workflow': 'ai-agents',
    'bot': 'ai-agents',
    'no-code': 'ai-agents',
    'nocode': 'ai-agents',
    'write': 'content-creation',
    'writing': 'content-creation',
    'content': 'content-creation',
    'blog': 'content-creation',
    'social': 'content-creation',
    'marketing': 'content-creation',
    'copy': 'content-creation',
    'seo': 'content-creation',
    'chat': 'chat-assistants',
    'assistant': 'chat-assistants',
    'companion': 'chat-assistants',
    'conversation': 'chat-assistants',
    'talk': 'chat-assistants',
    'education': 'education-learning',
    'learn': 'education-learning',
    'study': 'education-learning',
    'teach': 'education-learning',
    'course': 'education-learning',
    'interview': 'education-learning',
    'exam': 'education-learning',
    'flashcard': 'education-learning',
    'productivity': 'productivity-business',
    'business': 'productivity-business',
    'email': 'productivity-business',
    'meeting': 'productivity-business',
    'presentation': 'productivity-business',
    'slide': 'productivity-business',
    'office': 'productivity-business',
    'search': 'search-research',
    'research': 'search-research',
    'detect': 'search-research',
    'analysis': 'search-research',
    'find': 'search-research',
    'health': 'specialized-industries',
    'medical': 'specialized-industries',
    'legal': 'specialized-industries',
    'finance': 'specialized-industries',
  };
  
  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (text.includes(keyword)) return category;
  }
  
  return CATEGORY_MAPPING[originalCategory] || 'chat-assistants';
}

async function toolExists(name: string): Promise<boolean> {
  const slug = generateSlug(name);
  const existing = await prisma.tool.findFirst({
    where: {
      OR: [
        { slug },
        { name: { equals: name, mode: 'insensitive' } }
      ]
    }
  });
  return !!existing;
}

async function getOrCreateCategory(categoryName: string, toolName?: string, toolDescription?: string) {
  let targetSlug: string;
  
  if (toolName && toolDescription) {
    targetSlug = autoCategorize(toolName, toolDescription, categoryName);
  } else {
    targetSlug = CATEGORY_MAPPING[categoryName] || generateSlug(categoryName);
  }
  
  const categoryNameMap: Record<string, string> = {
    'ai-agents': 'AI Agents & Automation',
    'video-creation': 'Video Creation',
    'image-design': 'Image & Design',
    'chat-assistants': 'Chat & Assistants',
    'developer-tools': 'Developer Tools',
    'content-creation': 'Content Creation',
    'productivity-business': 'Productivity & Business',
    'education-learning': 'Education & Learning',
    'search-research': 'Search & Research',
    'specialized-industries': 'Specialized Industries',
    'special-offers': 'Special Offers',
  };
  
  let category = await prisma.category.findUnique({
    where: { slug: targetSlug }
  });

  if (!category) {
    const displayName = categoryNameMap[targetSlug] || categoryName;
    category = await prisma.category.create({
      data: {
        slug: targetSlug,
        name: displayName,
        description: `AI tools for ${displayName.toLowerCase()}`,
        sortOrder: 0,
      }
    });
    console.log(`  创建新分类: ${displayName}`);
  }

  return category;
}

/**
 * 保存工具（带验证和自动修复）
 */
async function saveToolWithValidation(
  tool: ScrapedTool, 
  logoFetcher: RobustLogoFetcher
): Promise<boolean> {
  try {
    // 检查是否已存在
    if (await toolExists(tool.name)) {
      console.log(`    ⏭️  已存在，跳过: ${tool.name}`);
      stats.totalSkipped++;
      return false;
    }

    // 前置检查：如果 website 明显可疑，先尝试修复
    let workingWebsite = tool.website;
    let websiteWasFixed = false;
    
    if (isSuspiciousUrl(workingWebsite)) {
      console.log(`    ⚠️  检测到可疑URL: ${workingWebsite}`);
      
      // 尝试解析跳转链接
      const { logo, website, wasFixed, issues } = await logoFetcher.fetchLogoWithValidation({
        name: tool.name,
        website: workingWebsite ?? null
      });

      if (wasFixed && website) {
        workingWebsite = website;
        websiteWasFixed = true;
        stats.urlFixed++;
        console.log(`    🔧 已修复URL: ${workingWebsite}`);
      } else if (!website) {
        console.log(`    ❌ 无法修复URL，跳过: ${tool.name}`);
        stats.validationErrors.push({ name: tool.name, issues: issues || ['无法修复URL'] });
        stats.totalFailed++;
        return false;
      }
    }

    // 获取或创建分类
    const category = await getOrCreateCategory(tool.category, tool.name, tool.description);

    // 创建工具（先不设置logo）
    const newTool = await prisma.tool.create({
      data: {
        slug: generateSlug(tool.name),
        name: tool.name,
        tagline: tool.description.slice(0, 100) + (tool.description.length > 100 ? '...' : ''),
        description: tool.description,
        website: workingWebsite || `https://www.google.com/search?q=${encodeURIComponent(tool.name + ' AI tool')}`,
        categoryId: category.id,
        pricingTier: mapPricingTier(tool.pricing),
        hasFreeTier: tool.pricing.toLowerCase().includes('free'),
        hasTrial: tool.pricing.toLowerCase().includes('trial'),
        isActive: true,
        isFeatured: false,
        features: [],
        useCases: [],
      }
    });

    // 添加价格历史记录
    await prisma.priceHistory.create({
      data: {
        toolId: newTool.id,
        pricingTier: mapPricingTier(tool.pricing),
        recordedAt: new Date(),
      }
    });

    console.log(`    ✅ 新增: ${tool.name} (${websiteWasFixed ? 'URL已修复' : '原始URL'})`);

    // 🎨 抓取 Logo（带验证）
    console.log(`    🎨 抓取Logo...`);
    const { logo, wasFixed: logoFixed, issues } = await logoFetcher.fetchLogoWithValidation({
      name: tool.name,
      website: workingWebsite ?? null
    });

    if (logo && !isPlaceholderLogo(logo)) {
      await prisma.tool.update({
        where: { id: newTool.id },
        data: { logo }
      });
      
      if (logoFixed) {
        stats.logoFixed++;
        console.log(`    ✅ Logo已设置（使用备用方法）`);
      } else {
        console.log(`    ✅ Logo已设置`);
      }
    } else {
      console.log(`    ⚠️ 未找到有效的Logo`);
      if (issues) {
        console.log(`       问题: ${issues.join(', ')}`);
      }
      stats.validationErrors.push({ name: tool.name, issues: issues || ['无法获取Logo'] });
    }

    return true;
  } catch (error) {
    console.error(`    ❌ 保存失败 ${tool.name}:`, error);
    stats.totalFailed++;
    return false;
  }
}

/**
 * 运行后自检：验证本次抓取的数据
 */
async function postScrapingValidation() {
  console.log();
  console.log('='.repeat(60));
  console.log('🔍 运行后自检...');
  console.log('='.repeat(60));

  const recentTools = await prisma.tool.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 最近24小时
      }
    },
    select: { name: true, website: true, logo: true }
  });

  let suspiciousCount = 0;
  let placeholderLogoCount = 0;

  for (const tool of recentTools) {
    if (isSuspiciousUrl(tool.website)) {
      suspiciousCount++;
      console.log(`  ⚠️  ${tool.name}: 可疑URL - ${tool.website}`);
    }
    if (isPlaceholderLogo(tool.logo)) {
      placeholderLogoCount++;
      console.log(`  ⚠️  ${tool.name}: 占位符Logo - ${tool.logo}`);
    }
  }

  console.log();
  console.log(`📊 自检结果: 共 ${recentTools.length} 个新工具`);
  console.log(`   可疑URL: ${suspiciousCount} 个`);
  console.log(`   占位符Logo: ${placeholderLogoCount} 个`);
  
  if (suspiciousCount === 0 && placeholderLogoCount === 0) {
    console.log('   ✅ 所有数据看起来正常！');
  } else {
    console.log('   ⚠️  发现问题，建议运行修复脚本: npx tsx scripts/fix-recent-scraped.ts');
  }
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 开始每日抓取 - 健壮版');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log(`目标: ${DAILY_TARGET} 条新工具`);
  console.log('功能: URL验证 + Logo验证 + 自动修复');
  console.log('='.repeat(60));
  console.log();

  const scraper = new AIToolsDirectoryScraper();
  const logoFetcher = new RobustLogoFetcher();
  const startTime = Date.now();
  
  try {
    await scraper.init();
    await logoFetcher.init();

    const categoryUrls = await scraper.getAllCategoryUrls();
    console.log(`发现 ${categoryUrls.length} 个分类页面`);
    console.log('开始抓取，直到新增30条工具或遍历完所有分类...\n');

    let categoryIndex = 0;

    for (const categoryUrl of categoryUrls) {
      if (stats.totalAdded >= DAILY_TARGET) {
        console.log(`\n🎯 已达到目标 ${DAILY_TARGET} 条新工具，停止抓取`);
        break;
      }

      categoryIndex++;
      console.log(`\n[${categoryIndex}/${categoryUrls.length}] 抓取: ${categoryUrl.split('/').pop()}`);
      console.log(`当前进度: 新增 ${stats.totalAdded}/${DAILY_TARGET} 条`);

      try {
        const tools = await scraper.scrapeCategoryPage(categoryUrl);
        console.log(`  该分类抓取到 ${tools.length} 个工具`);

        if (tools.length === 0) {
          console.log('  ⚠️ 该分类无工具');
          continue;
        }

        for (const tool of tools) {
          if (stats.totalAdded >= DAILY_TARGET) break;

          stats.totalScraped++;
          const isNew = await saveToolWithValidation(tool, logoFetcher);
          
          if (isNew) {
            stats.totalAdded++;
          }

          await new Promise(resolve => setTimeout(resolve, 800));
        }

        console.log(`  分类完成 - 新增: ${stats.totalAdded}, 跳过: ${stats.totalSkipped}, 失败: ${stats.totalFailed}`);
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`  ✗ 抓取分类失败:`, error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const totalDuration = Math.round((Date.now() - startTime) / 60000);
    
    console.log();
    console.log('='.repeat(60));
    console.log('🎉 抓取完成!');
    console.log(`总耗时: ${totalDuration} 分钟`);
    console.log(`遍历分类: ${categoryIndex}/${categoryUrls.length} 个`);
    console.log(`抓取工具: ${stats.totalScraped} 个`);
    console.log(`✅ 新增: ${stats.totalAdded} 个`);
    console.log(`⏭️  已存在: ${stats.totalSkipped} 个`);
    console.log(`❌ 失败: ${stats.totalFailed} 个`);
    console.log(`🔧 URL修复: ${stats.urlFixed} 个`);
    console.log(`🎨 Logo修复: ${stats.logoFixed} 个`);
    
    if (stats.validationErrors.length > 0) {
      console.log(`\n⚠️  验证问题: ${stats.validationErrors.length} 个`);
      stats.validationErrors.slice(0, 5).forEach(err => {
        console.log(`   - ${err.name}: ${err.issues.join(', ')}`);
      });
    }
    
    if (stats.totalAdded < DAILY_TARGET) {
      console.log(`\n⚠️  警告: 未达到目标 ${DAILY_TARGET} 条`);
    }
    
    console.log('='.repeat(60));

    // 运行后自检
    await postScrapingValidation();

  } catch (error) {
    console.error('抓取过程出错:', error);
    process.exit(1);
  } finally {
    await scraper.close();
    await logoFetcher.close();
    await prisma.$disconnect();
  }
}

main().catch(console.error);

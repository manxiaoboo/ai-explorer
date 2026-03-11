#!/usr/bin/env tsx
/**
 * 每周数据更新脚本 - 更新所有现有工具的信息
 * 运行频率: 每周一次 (cron: 0 3 * * 0)
 * 功能:
 * 1. 遍历数据库中所有来自 aitoolsdirectory.com 的工具
 * 2. 重新抓取最新数据（仅 aitoolsdirectory.com，不抓 logo）
 * 3. 更新描述、价格等信息
 * 4. 记录价格变化历史
 */

import { prisma } from './lib/prisma';
import { AIToolsDirectoryScraper, ScrapedTool } from './lib/aitools-scraper';
import { PricingTier } from '@prisma/client';

// 生成 slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// 分类映射表（精简后的新分类）
const CATEGORY_MAPPING: Record<string, string> = {
  'AI Agents': 'ai-agents', 'Automation': 'ai-agents', 'NoCode': 'ai-agents',
  'Video Generation': 'video-creation', 'Generative Video': 'video-creation', 'Text-to-Video': 'video-creation', 'Video Editing': 'video-creation',
  'Generative Art': 'image-design', 'Image Editing': 'image-design', 'Design': 'image-design', 'Image': 'image-design',
  'Chat': 'chat-assistants', 'Chatbot': 'chat-assistants',
  'Coding': 'developer-tools', 'Code': 'developer-tools',
  'Copywriting': 'content-creation', 'Writing': 'content-creation', 'Social Media': 'content-creation', 'Marketing': 'content-creation',
  'Productivity': 'productivity-business', 'Business Intelligence': 'productivity-business',
  'Education': 'education-learning', 'Recruitment': 'education-learning',
  'AI Detection': 'search-research', 'Search': 'search-research',
  'Health Tech': 'specialized-industries',
  'Lifetime Deal': 'special-offers',
};

// 价格层级映射
function mapPricingTier(pricing: string): PricingTier {
  const normalized = pricing.toLowerCase().trim();
  if (normalized.includes('free') && !normalized.includes('paid')) return PricingTier.FREE;
  if (normalized.includes('freemium') || (normalized.includes('free') && normalized.includes('paid'))) return PricingTier.FREEMIUM;
  if (normalized.includes('open source')) return PricingTier.OPEN_SOURCE;
  if (normalized.includes('enterprise') || normalized.includes('contact')) return PricingTier.ENTERPRISE;
  return PricingTier.PAID;
}

// 更新单个工具
async function updateTool(existingTool: any, scrapedData: ScrapedTool) {
  try {
    const newPricingTier = mapPricingTier(scrapedData.pricing);
    const oldPricingTier = existingTool.pricingTier;
    
    // 检查是否有变化
    const hasChanges = 
      existingTool.description !== scrapedData.description ||
      existingTool.tagline !== scrapedData.description.slice(0, 100) ||
      oldPricingTier !== newPricingTier;

    if (!hasChanges) {
      console.log(`  → ${existingTool.name}: 无需更新`);
      return { updated: false, priceChanged: false };
    }

    // 更新工具（不更新 logo）
    await prisma.tool.update({
      where: { id: existingTool.id },
      data: {
        tagline: scrapedData.description.slice(0, 100) + (scrapedData.description.length > 100 ? '...' : ''),
        description: scrapedData.description,
        pricingTier: newPricingTier,
        hasFreeTier: scrapedData.pricing.toLowerCase().includes('free'),
        hasTrial: scrapedData.pricing.toLowerCase().includes('trial'),
        updatedAt: new Date(),
      }
    });

    // 如果价格变化，记录历史
    if (oldPricingTier !== newPricingTier) {
      await prisma.priceHistory.create({
        data: {
          toolId: existingTool.id,
          pricingTier: newPricingTier,
          recordedAt: new Date(),
        }
      });
      console.log(`  ✓ ${existingTool.name}: 价格变更 ${oldPricingTier} → ${newPricingTier}`);
      return { updated: true, priceChanged: true };
    }

    console.log(`  ✓ ${existingTool.name}: 信息已更新`);
    return { updated: true, priceChanged: false };

  } catch (error) {
    console.error(`  ✗ 更新失败 ${existingTool.name}:`, error);
    return { updated: false, priceChanged: false };
  }
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('开始每周数据更新 - aitoolsdirectory.com');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('注意: 本脚本使用温和抓取策略，避免被封 IP');
  console.log('='.repeat(60));
  console.log();

  const scraper = new AIToolsDirectoryScraper();
  const startTime = Date.now();
  
  try {
    await scraper.init();

    // 获取数据库中所有工具（分批处理）
    console.log('获取现有工具列表...');
    console.log('注意: 为避免过多请求，将分批处理工具\n');
    
    const existingTools = await prisma.tool.findMany({
      take: 30, // 每次最多更新 30 个工具，避免过多请求
      orderBy: { updatedAt: 'asc' }, // 优先更新最久未更新的
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        pricingTier: true,
        hasFreeTier: true,
        hasTrial: true,
        website: true,
      }
    });

    console.log(`数据库中有 ${existingTools.length} 个工具\n`);

    // 抓取最新数据
    console.log('正在抓取最新数据...\n');
    const scrapedTools = await scraper.scrapeAllTools(20);
    
    // 创建抓取数据映射
    const scrapedMap = new Map<string, ScrapedTool>();
    for (const tool of scrapedTools) {
      const key = generateSlug(tool.name);
      scrapedMap.set(key, tool);
      // 也按名称存储
      scrapedMap.set(tool.name.toLowerCase(), tool);
    }

    console.log('-'.repeat(60));
    console.log('开始更新工具...\n');

    let updated = 0;
    let priceChanged = 0;
    let noChange = 0;
    let notFound = 0;

    for (const tool of existingTools) {
      const scrapedData = scrapedMap.get(tool.slug) || scrapedMap.get(tool.name.toLowerCase());
      
      if (!scrapedData) {
        console.log(`  ⚠ ${tool.name}: 在数据源中未找到`);
        notFound++;
        continue;
      }

      const result = await updateTool(tool, scrapedData);
      
      if (result.updated) {
        updated++;
        if (result.priceChanged) priceChanged++;
      } else {
        noChange++;
      }

      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const totalDuration = Math.round((Date.now() - startTime) / 60000);
    console.log();
    console.log('='.repeat(60));
    console.log('更新完成!');
    console.log(`总耗时: ${totalDuration} 分钟`);
    console.log(`处理工具: ${existingTools.length} 个`);
    console.log(`已更新: ${updated} 个 (价格变更: ${priceChanged} 个)`);
    console.log(`无需更新: ${noChange} 个`);
    console.log(`数据源未找到: ${notFound} 个`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('更新过程出错:', error);
    process.exit(1);
  } finally {
    await scraper.close();
    await prisma.$disconnect();
  }
}

// 运行主函数
main().catch(console.error);

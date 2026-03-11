#!/usr/bin/env tsx
/**
 * 快速抓取10条工具数据（仅 aitoolsdirectory.com，不抓 logo）
 * 用法: npx tsx scripts/grab-10-tools.ts
 */

import { prisma } from './lib/prisma';
import { AIToolsDirectoryScraper, ScrapedTool } from './lib/aitools-scraper';
import { PricingTier } from '@prisma/client';

// 分类映射表
const CATEGORY_MAPPING: Record<string, string> = {
  'Video Generation': 'video-generation',
  'Generative Art': 'generative-art',
  'Generative Video': 'generative-video',
  'Automation': 'automation',
  'AI Agents': 'ai-agents',
  'Chat': 'chat',
  'Productivity': 'productivity',
  'Recruitment': 'recruitment',
  'Education': 'education',
  'Business Intelligence': 'business-intelligence',
  'Marketing': 'marketing',
  'SEO': 'seo',
  'Social Media': 'social-media',
  'Audio': 'audio',
  'Music': 'music',
  'Copywriting': 'copywriting',
  'Coding': 'coding',
  'Gaming': 'gaming',
  'Advertising': 'advertising',
  'Podcasting': 'podcasting',
  'Text-to-Video': 'text-to-video',
  'Text-to-Voice': 'text-to-voice',
  'AI Detection': 'ai-detection',
  'Editing': 'editing',
  'Marke': 'marketing',
};

function mapPricingTier(pricing: string): PricingTier {
  const normalized = pricing.toLowerCase().trim();
  if (normalized.includes('free') && !normalized.includes('paid')) return PricingTier.FREE;
  if (normalized.includes('freemium')) return PricingTier.FREEMIUM;
  if (normalized.includes('open source')) return PricingTier.OPEN_SOURCE;
  if (normalized.includes('enterprise') || normalized.includes('contact')) return PricingTier.ENTERPRISE;
  return PricingTier.PAID;
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function getOrCreateCategory(categoryName: string) {
  const slug = CATEGORY_MAPPING[categoryName] || generateSlug(categoryName);
  
  let category = await prisma.category.findUnique({ where: { slug } });

  if (!category) {
    category = await prisma.category.create({
      data: {
        slug,
        name: categoryName,
        description: `AI tools for ${categoryName.toLowerCase()}`,
        sortOrder: 0,
      }
    });
    console.log(`  ✅ 创建新分类: ${categoryName}`);
  }

  return category;
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

async function saveTool(tool: ScrapedTool) {
  try {
    if (await toolExists(tool.name)) {
      console.log(`  ⚠️  已存在: ${tool.name}`);
      return null;
    }

    const category = await getOrCreateCategory(tool.category);

    const newTool = await prisma.tool.create({
      data: {
        slug: generateSlug(tool.name),
        name: tool.name,
        tagline: tool.description.slice(0, 100) + (tool.description.length > 100 ? '...' : ''),
        description: tool.description,
        website: tool.website || `https://www.google.com/search?q=${encodeURIComponent(tool.name + ' AI tool')}`,
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

    await prisma.priceHistory.create({
      data: {
        toolId: newTool.id,
        pricingTier: mapPricingTier(tool.pricing),
        recordedAt: new Date(),
      }
    });

    console.log(`  ✅ 已添加: ${tool.name}`);
    return newTool;
  } catch (error) {
    console.error(`  ❌ 失败 ${tool.name}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 开始抓取 10 条工具数据\n');
  console.log('='.repeat(70));

  const scraper = new AIToolsDirectoryScraper();
  
  try {
    await scraper.init();
    
    console.log('\n📥 正在从 aitoolsdirectory.com 抓取...\n');
    
    // 抓取首页工具
    let tools = await scraper.scrapeCategoryPage('https://aitoolsdirectory.com');
    
    // 只取前10个
    tools = tools.slice(0, 10);
    
    console.log('\n💾 正在保存到数据库...\n');
    console.log('-'.repeat(70));

    let added = 0;
    let skipped = 0;

    for (const tool of tools) {
      const result = await saveTool(tool);
      if (result) {
        added++;
      } else {
        skipped++;
      }
      await new Promise(r => setTimeout(r, 300));
    }

    console.log('-'.repeat(70));
    console.log('\n✨ 抓取完成！');
    console.log(`\n📈 统计:`);
    console.log(`   抓取总数: ${tools.length} 个`);
    console.log(`   ✅ 新增: ${added} 个`);
    console.log(`   ⚠️  已存在: ${skipped} 个`);
    console.log('='.repeat(70));

    // 显示抓取的详细数据
    console.log('\n📋 抓取详情:\n');
    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   类别: ${tool.category}`);
      console.log(`   价格: ${tool.pricing}`);
      console.log(`   描述: ${tool.description.slice(0, 60)}...`);

      console.log(`   网站: ${tool.website || 'N/A'}`);
      console.log();
    });

  } catch (error) {
    console.error('\n❌ 抓取失败:', error);
  } finally {
    await scraper.close();
    await prisma.$disconnect();
  }
}

main();

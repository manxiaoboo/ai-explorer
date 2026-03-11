#!/usr/bin/env tsx
/**
 * 每日抓取脚本 - 从 aitoolsdirectory.com 抓取新工具
 * 规则：每天必须抓取30条新工具（数据库中不存在的），已存在的工具不计入数量
 * 运行频率: 每天一次 (cron: 0 2 * * *)
 */

import { prisma } from './lib/prisma';
import { AIToolsDirectoryScraper, ScrapedTool } from './lib/aitools-scraper';
import { MultiSourceLogoFetcher } from './lib/logo-fetcher';
import { PricingTier } from '@prisma/client';

// 每日目标：必须新增30条工具
const DAILY_TARGET = 30;

// 分类映射表（从数据源名称到精简后的新分类 slug）
const CATEGORY_MAPPING: Record<string, string> = {
  // AI Agents & Automation
  'AI Agents': 'ai-agents',
  'Automation': 'ai-agents',
  'NoCode': 'ai-agents',
  'No Code': 'ai-agents',
  
  // Video Creation
  'Video Generation': 'video-creation',
  'Generative Video': 'video-creation',
  'Text-to-Video': 'video-creation',
  'Video Editing': 'video-creation',
  'Lifetime Deal': 'video-creation',
  
  // Image & Design
  'Generative Art': 'image-design',
  'Image Editing': 'image-design',
  'Design': 'image-design',
  'Image': 'image-design',
  'Editing': 'image-design',
  
  // Chat & Assistants
  'Chat': 'chat-assistants',
  'Chatbot': 'chat-assistants',
  'Assistant': 'chat-assistants',
  'Audio': 'chat-assistants',
  'Music': 'chat-assistants',
  'Text-to-Voice': 'chat-assistants',
  
  // Developer Tools
  'Coding': 'developer-tools',
  'Code': 'developer-tools',
  'Developer Tools': 'developer-tools',
  'Data': 'developer-tools',
  'Gaming': 'developer-tools',
  
  // Content Creation
  'Copywriting': 'content-creation',
  'Writing': 'content-creation',
  'Content': 'content-creation',
  'Social Media': 'content-creation',
  'Marketing': 'content-creation',
  'SEO': 'content-creation',
  'Advertising': 'content-creation',
  'Podcasting': 'content-creation',
  'Marke': 'content-creation',
  
  // Productivity & Business
  'Productivity': 'productivity-business',
  'Business Intelligence': 'productivity-business',
  'Presentation Maker': 'productivity-business',
  
  // Education & Learning
  'Education': 'education-learning',
  'Recruitment': 'education-learning',
  
  // Search & Research
  'AI Detection': 'search-research',
  'Search': 'search-research',
  
  // Specialized Industries
  'Health Tech': 'specialized-industries',
  
  // Special Offers (保留)
  'Special Offers': 'special-offers',
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

// 生成 slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// 自动归类函数 - 基于工具名称和描述进行智能分类
function autoCategorize(name: string, description: string, originalCategory: string): string {
  const text = (name + ' ' + description).toLowerCase();
  
  // 关键词映射（按优先级排序）
  const keywordMap: Record<string, string> = {
    // Video Creation (最高优先级)
    'video': 'video-creation',
    'clip': 'video-creation',
    'reel': 'video-creation',
    'footage': 'video-creation',
    'film': 'video-creation',
    
    // Image & Design
    'image': 'image-design',
    'photo': 'image-design',
    'design': 'image-design',
    'art': 'image-design',
    'draw': 'image-design',
    'sketch': 'image-design',
    'thumbnail': 'image-design',
    'logo': 'image-design',
    
    // Developer Tools
    'code': 'developer-tools',
    'coding': 'developer-tools',
    'developer': 'developer-tools',
    'programming': 'developer-tools',
    'api': 'developer-tools',
    'database': 'developer-tools',
    'github': 'developer-tools',
    'git': 'developer-tools',
    
    // AI Agents & Automation
    'agent': 'ai-agents',
    'automation': 'ai-agents',
    'automate': 'ai-agents',
    'workflow': 'ai-agents',
    'bot': 'ai-agents',
    'no-code': 'ai-agents',
    'nocode': 'ai-agents',
    
    // Content Creation
    'write': 'content-creation',
    'writing': 'content-creation',
    'content': 'content-creation',
    'blog': 'content-creation',
    'social': 'content-creation',
    'marketing': 'content-creation',
    'copy': 'content-creation',
    'seo': 'content-creation',
    
    // Chat & Assistants
    'chat': 'chat-assistants',
    'assistant': 'chat-assistants',
    'companion': 'chat-assistants',
    'conversation': 'chat-assistants',
    'talk': 'chat-assistants',
    
    // Education & Learning
    'education': 'education-learning',
    'learn': 'education-learning',
    'study': 'education-learning',
    'teach': 'education-learning',
    'course': 'education-learning',
    'interview': 'education-learning',
    'exam': 'education-learning',
    'flashcard': 'education-learning',
    
    // Productivity & Business
    'productivity': 'productivity-business',
    'business': 'productivity-business',
    'email': 'productivity-business',
    'meeting': 'productivity-business',
    'presentation': 'productivity-business',
    'slide': 'productivity-business',
    'office': 'productivity-business',
    
    // Search & Research
    'search': 'search-research',
    'research': 'search-research',
    'detect': 'search-research',
    'analysis': 'search-research',
    'find': 'search-research',
    
    // Specialized Industries
    'health': 'specialized-industries',
    'medical': 'specialized-industries',
    'legal': 'specialized-industries',
    'finance': 'specialized-industries',
  };
  
  // 按关键词匹配
  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (text.includes(keyword)) {
      return category;
    }
  }
  
  // 如果关键词不匹配，使用原始分类映射
  return CATEGORY_MAPPING[originalCategory] || 'chat-assistants';
}

// 检查工具是否已存在
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

// 获取或创建分类（支持自动归类）
async function getOrCreateCategory(categoryName: string, toolName?: string, toolDescription?: string) {
  // 使用自动归类逻辑
  let targetSlug: string;
  
  if (toolName && toolDescription) {
    targetSlug = autoCategorize(toolName, toolDescription, categoryName);
  } else {
    targetSlug = CATEGORY_MAPPING[categoryName] || generateSlug(categoryName);
  }
  
  // 分类名称映射
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
    console.log(`  创建新分类: ${displayName} (${targetSlug})`);
  }

  return category;
}

// 保存单个工具（带Logo抓取）
async function saveToolWithLogo(tool: ScrapedTool, logoFetcher: MultiSourceLogoFetcher): Promise<boolean> {
  try {
    // 检查是否已存在
    if (await toolExists(tool.name)) {
      console.log(`    ⏭️  已存在，跳过: ${tool.name}`);
      return false;
    }

    // 获取或创建分类（使用自动归类）
    const category = await getOrCreateCategory(tool.category, tool.name, tool.description);

    // 创建工具
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

    // 添加价格历史记录
    await prisma.priceHistory.create({
      data: {
        toolId: newTool.id,
        pricingTier: mapPricingTier(tool.pricing),
        recordedAt: new Date(),
      }
    });

    console.log(`    ✅ 新增: ${tool.name} (${tool.pricing})`);

    // 🎨 自动抓取Logo（使用外部URL）
    console.log(`    🎨 抓取Logo...`);
    const logoUrl = await logoFetcher.fetchLogo({ 
      name: tool.name, 
      website: tool.website || null 
    });

    if (logoUrl) {
      await prisma.tool.update({
        where: { id: newTool.id },
        data: { logo: logoUrl }
      });
      console.log(`    ✅ Logo已设置: ${logoUrl.slice(0, 50)}...`);
    } else {
      console.log(`    ⚠️ 未找到Logo`);
    }

    return true;
  } catch (error) {
    console.error(`    ❌ 保存失败 ${tool.name}:`, error);
    return false;
  }
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('开始每日抓取 - aitoolsdirectory.com');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log(`目标: 必须新增 ${DAILY_TARGET} 条工具（已存在的不计入）`);
  console.log('功能: 自动抓取工具 + 自动获取Logo');
  console.log('='.repeat(60));
  console.log();

  const scraper = new AIToolsDirectoryScraper();
  const logoFetcher = new MultiSourceLogoFetcher();
  const startTime = Date.now();
  
  try {
    await scraper.init();
    await logoFetcher.init();

    // 获取所有分类URL
    const categoryUrls = await scraper.getAllCategoryUrls();
    console.log(`发现 ${categoryUrls.length} 个分类页面`);
    console.log('开始抓取，直到新增30条工具或遍历完所有分类...\n');

    let totalScraped = 0;      // 总共抓取的工具数
    let totalAdded = 0;        // 实际新增的工具数（只算新的）
    let totalSkipped = 0;      // 已存在的工具数
    let totalFailed = 0;       // 保存失败的工具数
    let categoryIndex = 0;     // 当前分类索引

    // 遍历所有分类，直到达到目标
    for (const categoryUrl of categoryUrls) {
      // 如果已经达到目标，停止
      if (totalAdded >= DAILY_TARGET) {
        console.log(`\n🎯 已达到目标 ${DAILY_TARGET} 条新工具，停止抓取`);
        break;
      }

      categoryIndex++;
      console.log(`\n[${categoryIndex}/${categoryUrls.length}] 抓取分类: ${categoryUrl}`);
      console.log(`当前进度: 已新增 ${totalAdded}/${DAILY_TARGET} 条`);

      try {
        // 抓取该分类的工具
        const tools = await scraper.scrapeCategoryPage(categoryUrl);
        console.log(`  该分类抓取到 ${tools.length} 个工具`);

        if (tools.length === 0) {
          console.log('  ⚠️ 该分类无工具，跳过');
          continue;
        }

        // 处理该分类的每个工具
        for (const tool of tools) {
          // 如果已经达到目标，停止
          if (totalAdded >= DAILY_TARGET) {
            break;
          }

          totalScraped++;

          // 尝试保存工具（带Logo抓取）
          const isNew = await saveToolWithLogo(tool, logoFetcher);
          
          if (isNew) {
            totalAdded++;
          } else if (await toolExists(tool.name)) {
            totalSkipped++;
          } else {
            totalFailed++;
          }

          // 添加延迟避免过载
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`  分类完成 - 新增: ${totalAdded}, 已存在: ${totalSkipped}, 失败: ${totalFailed}`);

        // 分类之间休息
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`  ✗ 抓取分类失败:`, error);
        // 出错后休息更久
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const totalDuration = Math.round((Date.now() - startTime) / 60000);
    
    console.log();
    console.log('='.repeat(60));
    console.log('抓取完成!');
    console.log(`总耗时: ${totalDuration} 分钟`);
    console.log(`遍历分类: ${categoryIndex}/${categoryUrls.length} 个`);
    console.log(`抓取工具: ${totalScraped} 个`);
    console.log(`✅ 新增: ${totalAdded} 个`);
    console.log(`⏭️  已存在: ${totalSkipped} 个`);
    console.log(`❌ 失败: ${totalFailed} 个`);
    
    if (totalAdded < DAILY_TARGET) {
      console.log(`\n⚠️  警告: 未达到目标 ${DAILY_TARGET} 条，仅新增 ${totalAdded} 条`);
      console.log('   可能原因：所有分类已遍历完毕或网站数据有限');
    } else {
      console.log(`\n🎉 恭喜: 成功达到目标 ${DAILY_TARGET} 条新工具！`);
    }
    
    console.log('='.repeat(60));

  } catch (error) {
    console.error('抓取过程出错:', error);
    process.exit(1);
  } finally {
    await scraper.close();
    await logoFetcher.close();
    await prisma.$disconnect();
  }
}

// 运行主函数
main().catch(console.error);

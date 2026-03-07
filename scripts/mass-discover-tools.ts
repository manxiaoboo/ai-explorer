#!/usr/bin/env node
/**
 * AI Tools Mass Discovery - 批量抓取300+工具
 * 扩大搜索范围，多源聚合
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_ACCELERATE || process.env.DATABASE_URL,
    },
  },
});

// 扩展的搜索关键词列表 - 覆盖更多类别
const GITHUB_QUERIES = [
  // AI 工具大类
  'AI tools stars:>500',
  'artificial intelligence tools stars:>300',
  'machine learning tools stars:>400',
  
  // 写作/内容
  'AI writing assistant stars:>200',
  'content generation AI stars:>200',
  'copywriting AI stars:>200',
  'essay writer AI stars:>100',
  
  // 图像
  'AI image generator stars:>300',
  'stable diffusion stars:>500',
  'AI art generator stars:>200',
  'image editing AI stars:>100',
  'photo enhancement AI stars:>100',
  
  // 代码/开发
  'AI code assistant stars:>300',
  'copilot alternative stars:>200',
  'AI programming assistant stars:>200',
  'code completion AI stars:>200',
  'developer tools AI stars:>200',
  
  // 聊天/对话
  'chatbot AI stars:>300',
  'conversational AI stars:>200',
  'LLM chat interface stars:>200',
  'AI assistant stars:>400',
  
  // 视频
  'AI video generator stars:>200',
  'video editing AI stars:>100',
  'text to video AI stars:>150',
  
  // 音频/语音
  'AI voice generator stars:>200',
  'text to speech AI stars:>200',
  'AI music generator stars:>150',
  'speech recognition AI stars:>150',
  
  // 数据/分析
  'AI data analysis stars:>200',
  'data visualization AI stars:>100',
  'AI analytics tools stars:>100',
  
  // 搜索/研究
  'AI search engine stars:>200',
  'AI research assistant stars:>100',
  'knowledge base AI stars:>100',
  
  // 设计
  'AI design tools stars:>200',
  'UI design AI stars:>100',
  'graphic design AI stars:>100',
  
  // 自动化/生产力
  'AI automation stars:>200',
  'workflow automation AI stars:>100',
  'AI productivity tools stars:>150',
  
  // 营销/SEO
  'AI marketing tools stars:>100',
  'SEO AI tools stars:>100',
  'AI content marketing stars:>100',
  
  // 特定技术
  'LangChain stars:>100',
  'LlamaIndex stars:>100',
  'OpenAI API tools stars:>100',
  'transformers tools stars:>200',
  'HuggingFace tools stars:>150',
  
  // 垂直领域
  'AI for education stars:>100',
  'AI healthcare tools stars:>100',
  'AI finance tools stars:>100',
  'AI legal tools stars:>50',
  'AI recruiting stars:>50',
];

// 智能分类函数
function categorizeTool(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  
  // 写作
  if (text.includes('write') || text.includes('essay') || text.includes('copy') || 
      text.includes('content') || text.includes('blog') || text.includes('article')) return 'writing';
  
  // 图像
  if (text.includes('image') || text.includes('photo') || text.includes('art') || 
      text.includes('picture') || text.includes('drawing') || text.includes('diffusion') ||
      text.includes('midjourney') || text.includes('dall-e') || text.includes('stable diffusion')) return 'image';
  
  // 代码
  if (text.includes('code') || text.includes('program') || text.includes('developer') || 
      text.includes('github') || text.includes('ide') || text.includes('copilot') ||
      text.includes('coding') || text.includes('software')) return 'code';
  
  // 聊天
  if (text.includes('chat') || text.includes('conversation') || text.includes('bot') || 
      text.includes('assistant') || text.includes('companion') || text.includes('llm')) return 'chat';
  
  // 视频
  if (text.includes('video') || text.includes('film') || text.includes('movie') || 
      text.includes('animation')) return 'video';
  
  // 音频
  if (text.includes('audio') || text.includes('voice') || text.includes('sound') || 
      text.includes('music') || text.includes('speech') || text.includes('tts') ||
      text.includes('text-to-speech')) return 'audio';
  
  // 数据
  if (text.includes('data') || text.includes('analytic') || text.includes('visualization') || 
      text.includes('chart') || text.includes('dashboard')) return 'data';
  
  // 搜索
  if (text.includes('search') || text.includes('research') || text.includes('discovery')) return 'search';
  
  // 设计
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || 
      text.includes('creative') || text.includes('graphic')) return 'design';
  
  // 营销
  if (text.includes('market') || text.includes('seo') || text.includes('ads') || 
      text.includes('social media')) return 'marketing';
  
  // 生产力
  if (text.includes('productivity') || text.includes('workflow') || text.includes('automation') || 
      text.includes('task') || text.includes('schedule')) return 'productivity';
  
  return 'other';
}

// 从 GitHub 抓取项目
async function fetchGitHubRepos(query: string, perPage: number = 30): Promise<any[]> {
  const repos: any[] = [];
  
  try {
    // 获取多页结果
    for (let page = 1; page <= 3; page++) {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'attooli-discovery',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        repos.push(...(data.items || []));
      }
      
      // 避免限流
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (error: any) {
    console.error(`GitHub fetch error for "${query}":`, error.message);
  }
  
  return repos;
}

// 转换 GitHub 项目为工具格式
function convertRepoToTool(repo: any): any {
  const categorySlug = categorizeTool(repo.name, repo.description || '');
  
  return {
    name: repo.name,
    slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 60),
    tagline: repo.description?.substring(0, 100) || 'Open source AI tool',
    description: repo.description || '',
    website: repo.homepage || repo.html_url,
    githubUrl: repo.html_url,
    categorySlug,
    pricingTier: 'OPEN_SOURCE',
    hasFreeTier: true,
    features: ['Open source', `⭐ ${repo.stargazers_count.toLocaleString()} stars`, `Updated ${new Date(repo.pushed_at).toLocaleDateString()}`],
    useCases: ['Development'],
    source: 'github',
    githubStars: repo.stargazers_count,
  };
}

// 主流程
async function main() {
  console.log('🚀 AI Tools Mass Discovery - 目标: 300+ 工具\n');
  console.log(`Database: ${process.env.DATABASE_ACCELERATE ? 'Accelerate' : 'Direct'}`);
  console.log(`开始时间: ${new Date().toLocaleString()}\n`);
  
  // 获取现有分类
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log(`📂 可用分类: ${categories.map(c => c.slug).join(', ')}\n`);
  
  const discoveredTools = new Map(); // 用于去重
  let totalSearched = 0;
  
  // 批量搜索 GitHub
  console.log('🔍 开始批量搜索 GitHub...\n');
  
  for (const query of GITHUB_QUERIES) {
    console.log(`  搜索: ${query}`);
    
    const repos = await fetchGitHubRepos(query, 30);
    totalSearched += repos.length;
    
    for (const repo of repos) {
      const tool = convertRepoToTool(repo);
      
      // 只保留有描述的、stars > 100 的
      if (repo.stargazers_count >= 100 && repo.description && !discoveredTools.has(tool.slug)) {
        discoveredTools.set(tool.slug, tool);
        console.log(`    ✅ ${tool.name} (${tool.githubStars} ⭐) - ${tool.categorySlug}`);
      }
    }
    
    // 显示进度
    if (discoveredTools.size % 50 === 0) {
      console.log(`\n📊 当前进度: ${discoveredTools.size} 个独特工具\n`);
    }
    
    // 达到目标就停止
    if (discoveredTools.size >= 400) {
      console.log('\n✅ 已达到目标数量，停止搜索\n');
      break;
    }
  }
  
  const uniqueTools = Array.from(discoveredTools.values());
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 搜索结果统计:`);
  console.log(`  搜索查询数: ${GITHUB_QUERIES.length}`);
  console.log(`  GitHub 项目总数: ${totalSearched}`);
  console.log(`  独特工具数: ${uniqueTools.length}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // 分类统计
  const categoryStats: Record<string, number> = {};
  for (const tool of uniqueTools) {
    categoryStats[tool.categorySlug] = (categoryStats[tool.categorySlug] || 0) + 1;
  }
  console.log('📂 分类分布:');
  Object.entries(categoryStats)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));
  console.log('');
  
  // 保存到数据库
  console.log('💾 开始保存到数据库...\n');
  let saved = 0;
  let skipped = 0;
  let failed = 0;
  
  // 按 stars 排序，优先保存高质量项目
  const sortedTools = uniqueTools.sort((a, b) => b.githubStars - a.githubStars);
  
  for (const tool of sortedTools) {
    try {
      const categoryId = categoryMap.get(tool.categorySlug);
      if (!categoryId) {
        console.log(`  ⚠️ 跳过 ${tool.name}: 未知分类 "${tool.categorySlug}"`);
        skipped++;
        continue;
      }
      
      // 检查是否已存在
      const existing = await prisma.tool.findUnique({
        where: { slug: tool.slug },
      });
      
      if (existing) {
        console.log(`  ⏭️ 跳过 ${tool.name}: 已存在`);
        skipped++;
        continue;
      }
      
      // 创建工具
      await prisma.tool.create({
        data: {
          name: tool.name.substring(0, 100),
          slug: tool.slug.substring(0, 60),
          tagline: tool.tagline,
          description: tool.description?.substring(0, 500) || '',
          website: tool.website,
          githubRepo: tool.githubUrl,
          categoryId,
          pricingTier: tool.pricingTier,
          hasFreeTier: tool.hasFreeTier,
          features: tool.features,
          useCases: tool.useCases,
          isActive: true,
          trendingScore: Math.min(Math.floor(tool.githubStars / 100) + Math.floor(Math.random() * 20), 100),
        },
      });
      
      console.log(`  ✅ 已保存: ${tool.name} (${tool.categorySlug})`);
      saved++;
      
      // 每保存50个显示一次进度
      if (saved % 50 === 0) {
        console.log(`\n📊 已保存 ${saved} 个工具...\n`);
      }
      
    } catch (error: any) {
      console.error(`  ❌ 失败 ${tool.name}:`, error.message);
      failed++;
    }
    
    // 延迟避免数据库压力
    await new Promise(r => setTimeout(r, 100));
  }
  
  // 最终统计
  const totalTools = await prisma.tool.count();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 最终统计:`);
  console.log(`  本次保存: ${saved}`);
  console.log(`  跳过(已存在/无分类): ${skipped}`);
  console.log(`  失败: ${failed}`);
  console.log(`  数据库总工具数: ${totalTools}`);
  console.log(`  结束时间: ${new Date().toLocaleString()}`);
  console.log(`${'='.repeat(60)}`);
  
  await prisma.$disconnect();
}

// 启动
main().catch(error => {
  console.error('❌ 错误:', error);
  process.exit(1);
});

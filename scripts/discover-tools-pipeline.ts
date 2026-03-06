#!/usr/bin/env node
/**
 * AI Tools Discovery Pipeline
 * Combines: Product Hunt + GitHub + SearXNG Search
 * 
 * Usage: npx tsx scripts/discover-tools-pipeline.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_ACCELERATE || process.env.DATABASE_URL,
    },
  },
});

// SearXNG 配置
const SEARXNG_URL = process.env.SEARXNG_URL || 'http://localhost:8080';

// 搜索关键词列表
const SEARCH_QUERIES = [
  'best AI writing tools 2025',
  'AI image generator tools',
  'AI code assistant developer tools',
  'AI chatbot conversational AI',
  'AI voice audio tools',
  'AI video editing generation',
  'AI data analysis visualization',
  'AI productivity workflow automation',
  'AI search engine research',
  'AI design creative tools',
];

// 通过 SearXNG 搜索
async function searchWithSearxng(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&format=json&engines=google,bing,duckduckgo`
    );
    
    if (!response.ok) {
      console.error(`SearXNG error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`SearXNG search failed:`, error);
    return [];
  }
}

// 从搜索结果提取工具信息
async function extractToolFromResult(result: any) {
  const url = new URL(result.url);
  const domain = url.hostname.replace('www.', '');
  
  return {
    name: result.title?.split(' - ')[0]?.split(' | ')[0]?.trim() || domain,
    website: result.url,
    description: result.content?.substring(0, 200) || '',
    source: 'searxng',
  };
}

// GitHub 抓取开源 AI 项目
async function fetchGitHubTrending() {
  console.log('🔍 Fetching GitHub trending AI projects...');
  
  try {
    // 使用 GitHub Search API
    const queries = [
      'AI tools stars:>1000 language:TypeScript',
      'AI assistant stars:>500',
      'chatbot AI stars:>500',
    ];
    
    const allRepos: any[] = [];
    
    for (const query of queries) {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'attooli-discovery',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        allRepos.push(...(data.items || []));
      }
    }
    
    return allRepos.map(repo => ({
      name: repo.name,
      slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      tagline: repo.description?.substring(0, 100) || 'Open source AI tool',
      description: repo.description || '',
      website: repo.homepage || repo.html_url,
      githubUrl: repo.html_url,
      categorySlug: 'code', // GitHub 项目默认归类为 code
      pricingTier: 'OPEN_SOURCE',
      hasFreeTier: true,
      features: ['Open source', `⭐ ${repo.stargazers_count} stars`],
      useCases: ['Development', 'Self-hosting'],
      source: 'github',
    }));
  } catch (error) {
    console.error('GitHub fetch error:', error);
    return [];
  }
}

// 抓取网页获取详细信息
async function scrapeToolDetails(url: string) {
  try {
    // 使用 Jina AI Reader API 提取网页内容
    const jinaUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
    const response = await fetch(jinaUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
    });
    
    if (!response.ok) return null;
    
    const text = await response.text();
    
    // 简单提取关键信息
    const lines = text.split('\n').filter(l => l.trim());
    const title = lines[0]?.replace(/^Title:\s*/, '') || '';
    const description = lines.slice(1, 5).join(' ').substring(0, 300);
    
    return { title, description };
  } catch (error) {
    return null;
  }
}

// 下载 Logo
async function downloadLogo(toolName: string, website: string): Promise<string | null> {
  const domain = new URL(website).hostname.replace('www.', '');
  
  // 尝试多个 Logo 源
  const sources = [
    // Clearbit Logo API
    `https://logo.clearbit.com/${domain}`,
    // Google Favicon
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    // DuckDuckGo
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];
  
  for (const source of sources) {
    try {
      const response = await fetch(source, { timeout: 5000 });
      if (response.ok && response.headers.get('content-type')?.includes('image')) {
        // 这里应该上传到 R2/CDN，返回 URL
        // 简化：返回源地址
        return source;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

// 智能分类
function categorizeTool(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  
  if (text.includes('image') || text.includes('photo') || text.includes('art')) return 'image';
  if (text.includes('code') || text.includes('program') || text.includes('developer')) return 'code';
  if (text.includes('write') || text.includes('content') || text.includes('copy')) return 'writing';
  if (text.includes('chat') || text.includes('conversation') || text.includes('bot')) return 'chat';
  if (text.includes('video') || text.includes('film')) return 'video';
  if (text.includes('audio') || text.includes('voice') || text.includes('sound')) return 'audio';
  if (text.includes('data') || text.includes('analytic')) return 'data';
  if (text.includes('search') || text.includes('research')) return 'search';
  if (text.includes('design') || text.includes('creative')) return 'design';
  if (text.includes('market') || text.includes('seo')) return 'marketing';
  if (text.includes('productivity') || text.includes('workflow')) return 'productivity';
  
  return 'other';
}

// 主流程
async function main() {
  console.log('🚀 AI Tools Discovery Pipeline\n');
  console.log(`Using SearXNG: ${SEARXNG_URL}`);
  console.log(`Database: ${process.env.DATABASE_ACCELERATE ? 'Accelerate' : 'Direct'}\n`);
  
  // 获取分类映射
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  
  const discoveredTools: any[] = [];
  
  // 1. SearXNG 搜索
  console.log('🔍 Phase 1: SearXNG Search');
  for (const query of SEARCH_QUERIES.slice(0, 3)) { // 先测试前3个
    console.log(`\n  Searching: ${query}`);
    const results = await searchWithSearxng(query);
    
    for (const result of results.slice(0, 5)) { // 每个查询取前5个
      try {
        const tool = await extractToolFromResult(result);
        const categorySlug = categorizeTool(tool.name, tool.description);
        
        discoveredTools.push({
          ...tool,
          slug: tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50),
          categorySlug,
          pricingTier: 'FREEMIUM',
          hasFreeTier: true,
        });
        
        console.log(`    ✅ ${tool.name}`);
      } catch (error) {
        // Skip invalid results
      }
    }
    
    // 延迟避免限流
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // 2. GitHub 开源项目
  console.log('\n🔍 Phase 2: GitHub Trending');
  const githubTools = await fetchGitHubTrending();
  discoveredTools.push(...githubTools);
  console.log(`  Found ${githubTools.length} GitHub projects`);
  
  // 去重
  const uniqueTools = Array.from(
    new Map(discoveredTools.map(t => [t.slug, t])).values()
  );
  
  console.log(`\n📊 Discovered ${uniqueTools.length} unique tools\n`);
  
  // 3. 保存到数据库
  console.log('💾 Saving to database...');
  let saved = 0;
  let skipped = 0;
  
  for (const tool of uniqueTools.slice(0, 20)) { // 先保存前20个测试
    try {
      const categoryId = categoryMap.get(tool.categorySlug);
      if (!categoryId) {
        console.log(`  ⚠️ Skip ${tool.name}: unknown category`);
        skipped++;
        continue;
      }
      
      // 检查是否已存在
      const existing = await prisma.tool.findUnique({
        where: { slug: tool.slug },
      });
      
      if (existing) {
        console.log(`  ⏭️ Skip ${tool.name}: already exists`);
        skipped++;
        continue;
      }
      
      await prisma.tool.create({
        data: {
          name: tool.name.substring(0, 100),
          slug: tool.slug.substring(0, 60),
          tagline: tool.tagline || tool.description?.substring(0, 100) || `${tool.name} AI tool`,
          description: tool.description?.substring(0, 500) || tool.tagline || '',
          website: tool.website,
          categoryId,
          pricingTier: tool.pricingTier || 'FREEMIUM',
          hasFreeTier: tool.hasFreeTier ?? true,
          features: tool.features || ['AI powered'],
          useCases: tool.useCases || ['Automation'],
          isActive: true,
          trendingScore: Math.floor(Math.random() * 30) + 10,
        },
      });
      
      console.log(`  ✅ ${tool.name}`);
      saved++;
    } catch (error) {
      console.error(`  ❌ ${tool.name}:`, error);
      skipped++;
    }
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  // 统计
  const totalTools = await prisma.tool.count();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`  Saved: ${saved}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total tools in DB: ${totalTools}`);
  console.log('='.repeat(50));
  
  await prisma.$disconnect();
}

// 检查 SearXNG 是否可用
async function checkSearxng() {
  try {
    const response = await fetch(`${SEARXNG_URL}/healthz`, { timeout: 5000 });
    return response.ok;
  } catch {
    return false;
  }
}

// 运行前检查
checkSearxng().then(available => {
  if (!available) {
    console.error(`❌ SearXNG not available at ${SEARXNG_URL}`);
    console.error('Please start SearXNG:');
    console.error('  docker-compose -f docker-compose.searxng.yml up -d');
    process.exit(1);
  }
  
  main().catch(console.error);
});

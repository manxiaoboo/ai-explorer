#!/usr/bin/env node
/**
 * AI Tools Discovery Pipeline
 * Combines: Product Hunt + GitHub + SearXNG Search (SearXNG optional)
 * 
 * Usage: 
 *   npx tsx scripts/discover-tools-pipeline.ts
 *   SEARXNG_URL=http://localhost:8080 npx tsx scripts/discover-tools-pipeline.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_ACCELERATE || process.env.DATABASE_URL,
    },
  },
});

const SEARXNG_URL = process.env.SEARXNG_URL || 'http://localhost:8080';

// 搜索关键词
const SEARCH_QUERIES = [
  'best AI writing tools 2025',
  'AI image generator tools', 
  'AI code assistant developer tools',
  'AI chatbot conversational AI',
];

// SearXNG 搜索
async function searchWithSearxng(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&format=json`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

// 从搜索结果提取工具
async function extractToolFromResult(result: any) {
  const url = new URL(result.url);
  const domain = url.hostname.replace('www.', '');
  return {
    name: result.title?.split(' - ')[0]?.split(' | ')[0]?.trim() || domain,
    website: result.url,
    description: result.content?.substring(0, 200) || '',
  };
}

// GitHub 抓取开源项目
async function fetchGitHubTrending(): Promise<any[]> {
  console.log('🔍 Fetching GitHub trending AI projects...');
  
  const queries = [
    'AI tools stars:>1000',
    'AI assistant stars:>500', 
    'chatbot AI stars:>500',
  ];
  
  const allRepos: any[] = [];
  
  for (const query of queries) {
    try {
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
    } catch (error) {
      console.error('GitHub fetch error:', error);
    }
  }
  
  return allRepos.map(repo => ({
    name: repo.name,
    slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    tagline: repo.description?.substring(0, 100) || 'Open source AI tool',
    description: repo.description || '',
    website: repo.homepage || repo.html_url,
    githubUrl: repo.html_url,
    categorySlug: 'code',
    pricingTier: 'OPEN_SOURCE',
    hasFreeTier: true,
    features: ['Open source', `⭐ ${repo.stargazers_count} stars`],
    useCases: ['Development', 'Self-hosting'],
    source: 'github',
  }));
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

// 检查 SearXNG
async function checkSearxng(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${SEARXNG_URL}/healthz`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// 主流程
async function main(useSearxng: boolean = true) {
  console.log('🚀 AI Tools Discovery Pipeline\n');
  console.log(`SearXNG: ${useSearxng ? 'Enabled' : 'Skipped (GitHub only)'}`);
  console.log(`Database: ${process.env.DATABASE_ACCELERATE ? 'Accelerate' : 'Direct'}\n`);
  
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  
  const discoveredTools: any[] = [];
  
  // Phase 1: SearXNG (如果可用)
  if (useSearxng) {
    console.log('🔍 Phase 1: SearXNG Search');
    for (const query of SEARCH_QUERIES.slice(0, 2)) {
      console.log(`  Searching: ${query}`);
      const results = await searchWithSearxng(query);
      
      for (const result of results.slice(0, 5)) {
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
        } catch {}
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  } else {
    console.log('⏭️  Phase 1: SearXNG skipped\n');
  }
  
  // Phase 2: GitHub
  console.log('🔍 Phase 2: GitHub Trending');
  const githubTools = await fetchGitHubTrending();
  discoveredTools.push(...githubTools);
  console.log(`  Found ${githubTools.length} GitHub projects\n`);
  
  // 去重
  const uniqueTools = Array.from(
    new Map(discoveredTools.map(t => [t.slug, t])).values()
  );
  
  console.log(`📊 Discovered ${uniqueTools.length} unique tools\n`);
  
  // 保存到数据库
  console.log('💾 Saving to database...');
  let saved = 0;
  let skipped = 0;
  
  for (const tool of uniqueTools.slice(0, 30)) {
    try {
      const categoryId = categoryMap.get(tool.categorySlug);
      if (!categoryId) {
        console.log(`  ⚠️ Skip ${tool.name}: unknown category`);
        skipped++;
        continue;
      }
      
      const existing = await prisma.tool.findUnique({
        where: { slug: tool.slug },
      });
      
      if (existing) {
        console.log(`  ⏭️ Skip ${tool.name}: exists`);
        skipped++;
        continue;
      }
      
      await prisma.tool.create({
        data: {
          name: tool.name.substring(0, 100),
          slug: tool.slug.substring(0, 60),
          tagline: tool.tagline || tool.description?.substring(0, 100) || `${tool.name} AI tool`,
          description: tool.description?.substring(0, 500) || '',
          website: tool.website,
          categoryId,
          pricingTier: (tool.pricingTier || 'FREEMIUM') as any,
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
  
  const totalTools = await prisma.tool.count();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`  Saved: ${saved}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total tools in DB: ${totalTools}`);
  console.log('='.repeat(50));
  
  await prisma.$disconnect();
}

// 启动
checkSearxng().then(available => {
  main(available).catch(console.error);
});

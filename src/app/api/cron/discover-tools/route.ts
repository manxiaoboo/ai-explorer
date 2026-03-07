import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Note: Using Node.js runtime for Prisma compatibility
// export const runtime = 'edge';

const SEARCH_QUERIES = [
  'AI writing tools',
  'AI image generators',
  'AI code assistants',
  'AI chatbots',
  'AI voice tools',
  'AI video editing',
  'AI productivity tools',
  'AI search engines',
  'AI design tools',
  'AI marketing tools',
];

// GitHub 抓取（Edge 兼容）
async function fetchGitHubRepos() {
  const queries = [
    'AI tools stars:>1000',
    'AI assistant stars:>500',
    'chatbot AI stars:>500',
    'LLM tools stars:>300',
  ];
  
  const repos: any[] = [];
  
  for (const query of queries.slice(0, 2)) { // 限制 2 个查询避免超时
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
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
    } catch (e) {
      console.error('GitHub fetch error:', e);
    }
    
    // 延迟避免限流
    await new Promise(r => setTimeout(r, 500));
  }
  
  return repos.map(repo => ({
    name: repo.name,
    slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    tagline: repo.description?.substring(0, 100) || 'Open source AI tool',
    description: repo.description || '',
    website: repo.homepage || repo.html_url,
    categorySlug: 'code',
    pricingTier: 'OPEN_SOURCE',
    hasFreeTier: true,
    features: ['Open source', `⭐ ${repo.stargazers_count} stars`],
    useCases: ['Development'],
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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const authHeader = request.headers.get('authorization');
  
  // 简单鉴权（通过 Vercel Cron 触发时会有 CRON_SECRET）
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // 获取分类映射
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
    
    const discoveredTools: any[] = [];
    
    // 从 GitHub 抓取
    const githubTools = await fetchGitHubRepos();
    discoveredTools.push(...githubTools);
    
    // 去重
    const uniqueTools = Array.from(
      new Map(discoveredTools.map(t => [t.slug, t])).values()
    );
    
    // 保存到数据库（限制数量避免超时）
    let saved = 0;
    let skipped = 0;
    
    for (const tool of uniqueTools.slice(0, 10)) {
      try {
        const categoryId = categoryMap.get(tool.categorySlug);
        if (!categoryId) {
          skipped++;
          continue;
        }
        
        // 检查是否已存在
        const existing = await prisma.tool.findUnique({
          where: { slug: tool.slug },
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        await prisma.tool.create({
          data: {
            name: tool.name.substring(0, 100),
            slug: tool.slug.substring(0, 60),
            tagline: tool.tagline,
            description: tool.description?.substring(0, 500) || '',
            website: tool.website,
            categoryId,
            pricingTier: tool.pricingTier as any,
            hasFreeTier: tool.hasFreeTier,
            features: tool.features,
            useCases: tool.useCases,
            isActive: true,
            trendingScore: Math.floor(Math.random() * 30) + 10,
          },
        });
        
        saved++;
      } catch (e) {
        skipped++;
      }
    }
    
    const totalTools = await prisma.tool.count();
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      discovered: uniqueTools.length,
      saved,
      skipped,
      totalTools,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 使用 Node.js runtime 支持更长时间运行（Vercel Pro 支持最长 5 分钟）
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 分钟

// 搜索关键词
const SEARCH_QUERIES = [
  'AI writing tools 2025',
  'AI image generators',
  'AI code assistants',
  'AI chatbots',
  'AI voice synthesis',
  'AI video editing',
  'AI productivity tools',
  'AI search engines',
  'AI design tools',
  'AI marketing automation',
];

// 从多个源抓取工具
async function discoverTools() {
  const discovered: any[] = [];
  
  // 1. GitHub Trending
  const githubQueries = [
    'AI tools stars:>1000',
    'AI assistant stars:>500',
    'chatbot AI stars:>500',
    'LLM framework stars:>300',
    'AI agents stars:>200',
  ];
  
  for (const query of githubQueries) {
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'attooli-discovery',
            ...(process.env.GITHUB_TOKEN && {
              'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }),
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const repos = data.items || [];
        
        for (const repo of repos) {
          discovered.push({
            name: repo.name,
            slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50),
            tagline: repo.description?.substring(0, 100) || `${repo.name} - AI tool`,
            description: repo.description || '',
            website: repo.homepage || repo.html_url,
            categorySlug: categorizeFromRepo(repo),
            pricingTier: 'OPEN_SOURCE',
            hasFreeTier: true,
            features: ['Open source', `⭐ ${repo.stargazers_count.toLocaleString()} stars`, repo.language || 'Multi-language'],
            useCases: ['Development', 'Self-hosting'],
            source: 'github',
            stars: repo.stargazers_count,
          });
        }
      }
      
      // 避免限流
      await delay(1000);
    } catch (e) {
      console.error('GitHub error:', e);
    }
  }
  
  // 2. AlternativeTo API（如果配置了 API key）
  if (process.env.ALTERNATIVE_TO_API_KEY) {
    try {
      const altTools = await fetchAlternativeTo();
      discovered.push(...altTools);
    } catch (e) {
      console.error('AlternativeTo error:', e);
    }
  }
  
  return discovered;
}

// 从仓库信息智能分类
function categorizeFromRepo(repo: any): string {
  const text = `${repo.name} ${repo.description} ${repo.topics?.join(' ') || ''}`.toLowerCase();
  
  if (text.includes('image') || text.includes('photo') || text.includes('art') || text.includes('drawing')) return 'image';
  if (text.includes('code') || text.includes('program') || text.includes('developer') || text.includes('coding')) return 'code';
  if (text.includes('write') || text.includes('content') || text.includes('copy') || text.includes('blog')) return 'writing';
  if (text.includes('chat') || text.includes('conversation') || text.includes('bot') || text.includes('gpt')) return 'chat';
  if (text.includes('video') || text.includes('film') || text.includes('movie')) return 'video';
  if (text.includes('audio') || text.includes('voice') || text.includes('sound') || text.includes('music')) return 'audio';
  if (text.includes('data') || text.includes('analytic') || text.includes('dataset')) return 'data';
  if (text.includes('search') || text.includes('research') || text.includes('crawler')) return 'search';
  if (text.includes('design') || text.includes('ui') || text.includes('figma') || text.includes('creative')) return 'design';
  if (text.includes('market') || text.includes('seo') || text.includes('ads')) return 'marketing';
  if (text.includes('productivity') || text.includes('workflow') || text.includes('automation')) return 'productivity';
  if (text.includes('translate') || text.includes('learn') || text.includes('education')) return 'education';
  
  return 'other';
}

// AlternativeTo API（可选）
async function fetchAlternativeTo(): Promise<any[]> {
  // AlternativeTo 需要 API key，这里预留接口
  return [];
}

// 延迟函数
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // 鉴权
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.ADMIN_API_KEY;
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('[Discovery] Starting tool discovery...');
    
    // 获取分类
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
    
    // 发现工具
    const tools = await discoverTools();
    
    // 去重
    const seenSlugs = new Set<string>();
    const uniqueTools = tools.filter(t => {
      if (seenSlugs.has(t.slug)) return false;
      seenSlugs.add(t.slug);
      return true;
    });
    
    console.log(`[Discovery] Found ${uniqueTools.length} unique tools`);
    
    // 保存到数据库
    let saved = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    for (const tool of uniqueTools) {
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
            description: tool.description?.substring(0, 500) || tool.tagline,
            website: tool.website,
            categoryId,
            pricingTier: tool.pricingTier as any,
            hasFreeTier: tool.hasFreeTier,
            features: tool.features,
            useCases: tool.useCases,
            isActive: true,
            trendingScore: Math.min(Math.floor((tool.stars || 0) / 100) + 10, 100),
          },
        });
        
        saved++;
        console.log(`[Discovery] Saved: ${tool.name}`);
      } catch (e: any) {
        errors.push(`${tool.name}: ${e.message}`);
        skipped++;
      }
    }
    
    const totalTools = await prisma.tool.count();
    const duration = Date.now() - startTime;
    
    const result = {
      success: true,
      discovered: uniqueTools.length,
      saved,
      skipped,
      errors: errors.slice(0, 5), // 只返回前5个错误
      totalTools,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    };
    
    console.log('[Discovery] Completed:', result);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Discovery] Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET 方法用于健康检查
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/cron/discover-tools-advanced',
    method: 'POST',
    auth: 'Bearer CRON_SECRET or ADMIN_API_KEY',
  });
}

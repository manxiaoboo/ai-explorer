import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Node.js runtime for longer execution
export const runtime = 'nodejs';
// Note: maxDuration requires Vercel Pro, removed for compatibility
// export const maxDuration = 300;

// 扩展的搜索关键词列表
const GITHUB_QUERIES = [
  // AI 工具大类
  { query: 'AI tools stars:>500', perPage: 30 },
  { query: 'artificial intelligence tools stars:>300', perPage: 20 },
  { query: 'machine learning tools stars:>400', perPage: 20 },
  
  // 写作/内容
  { query: 'AI writing assistant stars:>200', perPage: 15 },
  { query: 'content generation AI stars:>200', perPage: 15 },
  { query: 'copywriting AI stars:>200', perPage: 15 },
  { query: 'essay writer AI stars:>100', perPage: 10 },
  
  // 图像
  { query: 'AI image generator stars:>300', perPage: 20 },
  { query: 'stable diffusion stars:>500', perPage: 20 },
  { query: 'AI art generator stars:>200', perPage: 15 },
  { query: 'image editing AI stars:>100', perPage: 10 },
  { query: 'photo enhancement AI stars:>100', perPage: 10 },
  
  // 代码/开发
  { query: 'AI code assistant stars:>300', perPage: 20 },
  { query: 'copilot alternative stars:>200', perPage: 15 },
  { query: 'AI programming assistant stars:>200', perPage: 15 },
  { query: 'code completion AI stars:>200', perPage: 15 },
  { query: 'developer tools AI stars:>200', perPage: 15 },
  
  // 聊天/对话
  { query: 'chatbot AI stars:>300', perPage: 20 },
  { query: 'conversational AI stars:>200', perPage: 15 },
  { query: 'LLM chat interface stars:>200', perPage: 15 },
  { query: 'AI assistant stars:>400', perPage: 20 },
  
  // 视频
  { query: 'AI video generator stars:>200', perPage: 15 },
  { query: 'video editing AI stars:>100', perPage: 10 },
  { query: 'text to video AI stars:>150', perPage: 10 },
  
  // 音频/语音
  { query: 'AI voice generator stars:>200', perPage: 15 },
  { query: 'text to speech AI stars:>200', perPage: 15 },
  { query: 'AI music generator stars:>150', perPage: 10 },
  { query: 'speech recognition AI stars:>150', perPage: 10 },
  
  // 数据/分析
  { query: 'AI data analysis stars:>200', perPage: 15 },
  { query: 'data visualization AI stars:>100', perPage: 10 },
  { query: 'AI analytics tools stars:>100', perPage: 10 },
  
  // 搜索/研究
  { query: 'AI search engine stars:>200', perPage: 15 },
  { query: 'AI research assistant stars:>100', perPage: 10 },
  { query: 'knowledge base AI stars:>100', perPage: 10 },
  
  // 设计
  { query: 'AI design tools stars:>200', perPage: 15 },
  { query: 'UI design AI stars:>100', perPage: 10 },
  { query: 'graphic design AI stars:>100', perPage: 10 },
  
  // 自动化/生产力
  { query: 'AI automation stars:>200', perPage: 15 },
  { query: 'workflow automation AI stars:>100', perPage: 10 },
  { query: 'AI productivity tools stars:>150', perPage: 10 },
  
  // 营销/SEO
  { query: 'AI marketing tools stars:>100', perPage: 10 },
  { query: 'SEO AI tools stars:>100', perPage: 10 },
  { query: 'AI content marketing stars:>100', perPage: 10 },
  
  // 特定技术
  { query: 'LangChain stars:>100', perPage: 10 },
  { query: 'LlamaIndex stars:>100', perPage: 10 },
  { query: 'OpenAI API tools stars:>100', perPage: 10 },
  { query: 'transformers tools stars:>200', perPage: 15 },
  { query: 'HuggingFace tools stars:>150', perPage: 10 },
  
  // 垂直领域
  { query: 'AI for education stars:>100', perPage: 10 },
  { query: 'AI healthcare tools stars:>100', perPage: 10 },
  { query: 'AI finance tools stars:>100', perPage: 10 },
  { query: 'AI legal tools stars:>50', perPage: 10 },
  { query: 'AI recruiting stars:>50', perPage: 10 },
];

// 智能分类
function categorizeTool(name: string, description: string, topics: string[] = []): string {
  const text = `${name} ${description} ${topics.join(' ')}`.toLowerCase();
  
  if (text.includes('write') || text.includes('essay') || text.includes('copy') || 
      text.includes('content') || text.includes('blog') || text.includes('article')) return 'writing';
  if (text.includes('image') || text.includes('photo') || text.includes('art') || 
      text.includes('picture') || text.includes('drawing') || text.includes('diffusion')) return 'image';
  if (text.includes('code') || text.includes('program') || text.includes('developer') || 
      text.includes('github') || text.includes('copilot') || text.includes('coding')) return 'code';
  if (text.includes('chat') || text.includes('conversation') || text.includes('bot') || 
      text.includes('assistant') || text.includes('llm')) return 'chat';
  if (text.includes('video') || text.includes('film') || text.includes('movie')) return 'video';
  if (text.includes('audio') || text.includes('voice') || text.includes('music') || 
      text.includes('speech') || text.includes('tts')) return 'audio';
  if (text.includes('data') || text.includes('analytic') || text.includes('visualization')) return 'data';
  if (text.includes('search') || text.includes('research')) return 'search';
  if (text.includes('design') || text.includes('ui') || text.includes('creative')) return 'design';
  if (text.includes('market') || text.includes('seo') || text.includes('ads')) return 'marketing';
  if (text.includes('productivity') || text.includes('workflow') || text.includes('automation')) return 'productivity';
  if (text.includes('translate') || text.includes('education') || text.includes('learn')) return 'education';
  
  return 'other';
}

// 延迟函数
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// 从 GitHub 抓取
async function fetchGitHubRepos(query: string, perPage: number): Promise<any[]> {
  const repos: any[] = [];
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'attooli-discovery',
  };
  
  // 使用 GitHub Token 提高速率限制
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`,
      { headers }
    );
    
    if (response.ok) {
      const data = await response.json();
      repos.push(...(data.items || []));
    } else {
      console.error(`GitHub API error for "${query}": ${response.status}`);
    }
  } catch (error: any) {
    console.error(`GitHub fetch error:`, error.message);
  }
  
  return repos;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // 鉴权
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.ADMIN_API_KEY;
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 解析查询参数
  const { searchParams } = new URL(request.url);
  const maxTools = parseInt(searchParams.get('max') || '300');
  const minStars = parseInt(searchParams.get('minStars') || '100');
  
  console.log(`[Batch Discovery] Starting batch discovery (max: ${maxTools}, minStars: ${minStars})...`);
  
  try {
    // 获取分类
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
    console.log(`[Batch Discovery] Available categories: ${categories.map(c => c.slug).join(', ')}`);
    
    const discoveredTools = new Map(); // 用于去重
    let totalSearched = 0;
    
    // 批量搜索 GitHub
    for (let i = 0; i < GITHUB_QUERIES.length; i++) {
      const { query, perPage } = GITHUB_QUERIES[i];
      console.log(`[Batch Discovery] [${i + 1}/${GITHUB_QUERIES.length}] Searching: ${query}`);
      
      const repos = await fetchGitHubRepos(query, perPage);
      totalSearched += repos.length;
      
      for (const repo of repos) {
        // 过滤条件
        if (repo.stargazers_count < minStars || !repo.description) continue;
        
        const categorySlug = categorizeTool(repo.name, repo.description, repo.topics || []);
        const tool = {
          name: repo.name.substring(0, 100),
          slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 60),
          tagline: repo.description?.substring(0, 100) || 'Open source AI tool',
          description: repo.description || '',
          website: repo.homepage || repo.html_url,
          githubUrl: repo.html_url,
          categorySlug,
          pricingTier: 'OPEN_SOURCE',
          hasFreeTier: true,
          features: ['Open source', `⭐ ${repo.stargazers_count.toLocaleString()} stars`, repo.language || 'Multi-language'],
          useCases: ['Development'],
          source: 'github',
          githubStars: repo.stargazers_count,
        };
        
        if (!discoveredTools.has(tool.slug)) {
          discoveredTools.set(tool.slug, tool);
        }
      }
      
      console.log(`[Batch Discovery] Progress: ${discoveredTools.size} unique tools`);
      
      // 达到目标数量就停止
      if (discoveredTools.size >= maxTools) {
        console.log(`[Batch Discovery] Reached target count (${maxTools}), stopping...`);
        break;
      }
      
      // 延迟避免限流
      await delay(800);
    }
    
    const uniqueTools = Array.from(discoveredTools.values());
    console.log(`[Batch Discovery] Total unique tools: ${uniqueTools.length}`);
    
    // 保存到数据库
    let saved = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    // 按 stars 排序，优先保存高质量项目
    const sortedTools = uniqueTools.sort((a, b) => b.githubStars - a.githubStars);
    
    for (const tool of sortedTools) {
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
            name: tool.name,
            slug: tool.slug,
            tagline: tool.tagline,
            description: tool.description?.substring(0, 500) || tool.tagline,
            website: tool.website,
            githubRepo: tool.githubUrl,
            categoryId,
            pricingTier: tool.pricingTier as any,
            hasFreeTier: tool.hasFreeTier,
            features: tool.features,
            useCases: tool.useCases,
            isActive: true,
            trendingScore: Math.min(Math.floor(tool.githubStars / 100) + Math.floor(Math.random() * 20), 100),
          },
        });
        
        saved++;
        console.log(`[Batch Discovery] Saved: ${tool.name} (${tool.categorySlug})`);
        
      } catch (error: any) {
        errors.push(`${tool.name}: ${error.message}`);
        console.error(`[Batch Discovery] Failed to save ${tool.name}:`, error.message);
      }
      
      // 延迟避免数据库压力
      await delay(100);
    }
    
    const totalTools = await prisma.tool.count();
    const duration = Date.now() - startTime;
    
    // 分类统计
    const categoryStats: Record<string, number> = {};
    for (const tool of uniqueTools) {
      categoryStats[tool.categorySlug] = (categoryStats[tool.categorySlug] || 0) + 1;
    }
    
    const result = {
      success: true,
      discovered: uniqueTools.length,
      saved,
      skipped,
      errors: errors.slice(0, 5),
      totalTools,
      durationMs: duration,
      categoryStats,
      timestamp: new Date().toISOString(),
    };
    
    console.log('[Batch Discovery] Completed:', result);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Batch Discovery] Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET 方法用于手动触发（带鉴权）
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || process.env.ADMIN_API_KEY;
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 转发到 POST 处理
  return POST(request);
}

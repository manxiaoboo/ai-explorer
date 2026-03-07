#!/usr/bin/env node
/**
 * AI Tools Mass Discovery to JSON - 批量抓取300+工具到本地文件
 * 数据库连接有问题时的备选方案
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';

// 扩展的搜索关键词列表
const GITHUB_QUERIES = [
  'AI tools stars:>500',
  'artificial intelligence tools stars:>300',
  'machine learning tools stars:>400',
  'AI writing assistant stars:>200',
  'content generation AI stars:>200',
  'AI image generator stars:>300',
  'stable diffusion stars:>500',
  'AI art generator stars:>200',
  'AI code assistant stars:>300',
  'copilot alternative stars:>200',
  'chatbot AI stars:>300',
  'conversational AI stars:>200',
  'LLM chat interface stars:>200',
  'AI assistant stars:>400',
  'AI video generator stars:>200',
  'video editing AI stars:>100',
  'AI voice generator stars:>200',
  'text to speech AI stars:>200',
  'AI music generator stars:>150',
  'AI data analysis stars:>200',
  'AI search engine stars:>200',
  'AI design tools stars:>200',
  'AI automation stars:>200',
  'AI productivity tools stars:>150',
  'AI marketing tools stars:>100',
  'SEO AI tools stars:>100',
  'LangChain stars:>100',
  'LlamaIndex stars:>100',
  'transformers tools stars:>200',
  'HuggingFace tools stars:>150',
  'AI for education stars:>100',
  'AI healthcare tools stars:>100',
  'AI finance tools stars:>100',
];

// 智能分类
function categorizeTool(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  
  if (text.includes('write') || text.includes('essay') || text.includes('copy') || 
      text.includes('content') || text.includes('blog') || text.includes('article')) return 'writing';
  if (text.includes('image') || text.includes('photo') || text.includes('art') || 
      text.includes('picture') || text.includes('diffusion')) return 'image';
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
  return 'other';
}

// 从 GitHub 抓取
async function fetchGitHubRepos(query: string): Promise<any[]> {
  const repos: any[] = [];
  
  for (let page = 1; page <= 2; page++) {
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30&page=${page}`,
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
        console.log(`    📄 第${page}页: ${data.items?.length || 0} 个结果`);
      }
      
      await new Promise(r => setTimeout(r, 800));
    } catch (error) {
      console.error(`    ❌ 错误:`, error.message);
    }
  }
  
  return repos;
}

// 主流程
async function main() {
  console.log('🚀 AI Tools Mass Discovery - 抓取到本地文件\n');
  console.log(`开始时间: ${new Date().toLocaleString()}\n`);
  
  const discoveredTools = new Map();
  let totalSearched = 0;
  
  console.log('🔍 开始批量搜索 GitHub...\n');
  
  for (let i = 0; i < GITHUB_QUERIES.length; i++) {
    const query = GITHUB_QUERIES[i];
    console.log(`[${i + 1}/${GITHUB_QUERIES.length}] 搜索: ${query}`);
    
    const repos = await fetchGitHubRepos(query);
    totalSearched += repos.length;
    
    for (const repo of repos) {
      if (repo.stargazers_count >= 100 && repo.description) {
        const categorySlug = categorizeTool(repo.name, repo.description);
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
          features: ['Open source', `⭐ ${repo.stargazers_count.toLocaleString()} stars`],
          useCases: ['Development'],
          source: 'github',
          githubStars: repo.stargazers_count,
          language: repo.language,
          pushedAt: repo.pushed_at,
        };
        
        if (!discoveredTools.has(tool.slug)) {
          discoveredTools.set(tool.slug, tool);
        }
      }
    }
    
    console.log(`    📊 当前累计: ${discoveredTools.size} 个独特工具\n`);
    
    if (discoveredTools.size >= 400) {
      console.log('✅ 已达到目标数量，停止搜索\n');
      break;
    }
  }
  
  const uniqueTools = Array.from(discoveredTools.values());
  
  // 保存到 JSON 文件
  const outputPath = join(process.cwd(), 'data', 'discovered-tools.json');
  await writeFile(outputPath, JSON.stringify(uniqueTools, null, 2));
  
  // 分类统计
  const categoryStats = {};
  for (const tool of uniqueTools) {
    categoryStats[tool.categorySlug] = (categoryStats[tool.categorySlug] || 0) + 1;
  }
  
  console.log('='.repeat(60));
  console.log('📊 抓取完成统计:');
  console.log(`  搜索查询数: ${GITHUB_QUERIES.length}`);
  console.log(`  GitHub 项目总数: ${totalSearched}`);
  console.log(`  独特工具数: ${uniqueTools.length}`);
  console.log(`  保存路径: ${outputPath}`);
  console.log('');
  console.log('📂 分类分布:');
  Object.entries(categoryStats)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));
  console.log('');
  console.log(`结束时间: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n💡 提示: 数据库连接恢复后，运行导入命令:');
  console.log('   npx tsx scripts/import-discovered-tools.ts');
}

main().catch(error => {
  console.error('❌ 错误:', error);
  process.exit(1);
});

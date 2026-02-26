/**
 * Comprehensive AI Tools Discovery - Daily Cron Job
 * Combines multiple data sources and prevents duplicates
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Chinese/non-international domains to filter out
const BLOCKED_DOMAINS = [
  '.cn',
  'baidu.com',
  'aliyun.com',
  'tencent.com',
  'xfyun.cn',
  'moonshot.cn',
  'modelscope.cn',
  '360.cn',
  'shutu.cn',
  'gitmind.cn',
  'newrank.cn',
  'pixso.cn',
  'arkie.cn',
  'codegeex.cn',
];

// Check if a URL or repo should be filtered out
function isBlocked(url: string | null, repoName: string = ''): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  const lowerRepo = repoName.toLowerCase();
  
  return BLOCKED_DOMAINS.some(domain => 
    lowerUrl.includes(domain) || lowerRepo.includes(domain.replace('.', ''))
  );
}

// Expanded search queries for more coverage
const GITHUB_QUERIES = [
  'ai tools stars:>50',
  'chatgpt clone stars:>30',
  'ai image generator stars:>30',
  'ai writing assistant stars:>30',
  'llm tools stars:>30',
  'openai alternative stars:>30',
  'ai chatbot stars:>30',
  'stable diffusion stars:>30',
  'ai voice stars:>20',
  'ai video stars:>20',
  'ai code assistant stars:>30',
  'ai productivity stars:>20',
  'machine learning tools stars:>50',
  'neural network tools stars:>30',
];

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
}

async function searchGitHub(query: string, perPage: number = 20): Promise<GitHubRepo[]> {
  if (!GITHUB_TOKEN) {
    console.log('No GITHUB_TOKEN, skipping GitHub search');
    return [];
  }
  
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Atooli-Discovery/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`GitHub search error:`, error);
    return [];
  }
}

function categorizeFromRepo(repo: GitHubRepo): string {
  const topics = repo.topics || [];
  const desc = (repo.description || '').toLowerCase();
  
  if (topics.includes('image') || desc.includes('image') || desc.includes('photo') || desc.includes('diffusion')) return 'Image';
  if (topics.includes('chat') || desc.includes('chat') || desc.includes('chatbot') || desc.includes('llm')) return 'Chat';
  if (topics.includes('writing') || desc.includes('write') || desc.includes('text')) return 'Writing';
  if (topics.includes('code') || desc.includes('code') || desc.includes('programming')) return 'Code';
  if (topics.includes('audio') || desc.includes('audio') || desc.includes('voice') || desc.includes('speech')) return 'Audio';
  if (topics.includes('video') || desc.includes('video')) return 'Video';
  if (topics.includes('productivity') || desc.includes('productivity') || desc.includes('workflow')) return 'Productivity';
  if (topics.includes('design') || desc.includes('design') || desc.includes('ui') || desc.includes('ux')) return 'Design';
  if (topics.includes('data') || desc.includes('data') || desc.includes('analytics')) return 'Data';
  
  return 'Other';
}

async function findOrCreateCategory(name: string) {
  let category = await prisma.category.findFirst({ where: { name } });
  
  if (!category) {
    category = await prisma.category.create({
      data: {
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        description: `${name} AI tools`,
      }
    });
    console.log(`Created category: ${name}`);
  }
  
  return category;
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase();
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function saveGitHubRepo(repo: GitHubRepo) {
  try {
    const website = repo.homepage || repo.html_url;
    
    // Filter out Chinese/non-international sites
    if (isBlocked(website, repo.full_name)) {
      console.log(`⏭️ Skipping (blocked domain): ${repo.name}`);
      return { action: 'skipped', name: repo.name };
    }
    
    const normalizedUrl = normalizeUrl(website);
    const slug = generateSlug(repo.name);
    
    // Check for duplicates
    const existing = await prisma.tool.findFirst({
      where: {
        OR: [
          { website: { contains: normalizedUrl } },
          { slug },
          { name: { equals: repo.name, mode: 'insensitive' } }
        ]
      }
    });
    
    if (existing) {
      // Update stars if exists
      if (existing.githubStars !== repo.stargazers_count) {
        await prisma.tool.update({
          where: { id: existing.id },
          data: { 
            githubStars: repo.stargazers_count,
            updatedAt: new Date()
          }
        });
        console.log(`Updated stars: ${repo.name} (${repo.stargazers_count})`);
      }
      return { action: 'updated', name: repo.name };
    }
    
    // Create new tool
    const category = await findOrCreateCategory(categorizeFromRepo(repo));
    
    await prisma.tool.create({
      data: {
        slug,
        name: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        tagline: repo.description?.substring(0, 100) || 'AI-powered tool',
        description: repo.description || '',
        website: website,
        categoryId: category.id,
        pricingTier: repo.stargazers_count > 500 ? 'OPEN_SOURCE' : 'FREE',
        githubStars: repo.stargazers_count,
        githubRepo: repo.full_name,
        isActive: true,
        trendingScore: Math.min(100, Math.round(repo.stargazers_count / 50)),
      }
    });
    
    console.log(`Created: ${repo.name} (${repo.stargazers_count} stars)`);
    return { action: 'created', name: repo.name };
    
  } catch (error) {
    console.error(`Error saving ${repo.name}:`, error);
    return { action: 'error', name: repo.name };
  }
}

async function discoverFromGitHub() {
  console.log('\n=== Discovering from GitHub ===\n');
  
  if (!GITHUB_TOKEN) {
    console.log('Skipping GitHub discovery (no token)');
    return { created: 0, updated: 0, errors: 0 };
  }
  
  const allRepos: GitHubRepo[] = [];
  const seenIds = new Set<number>();
  
  for (const query of GITHUB_QUERIES) {
    console.log(`Searching: ${query}`);
    const repos = await searchGitHub(query, 15);
    
    for (const repo of repos) {
      if (!seenIds.has(repo.id)) {
        seenIds.add(repo.id);
        allRepos.push(repo);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit
  }
  
  console.log(`\nFound ${allRepos.length} unique repositories\n`);
  
  const results = { created: 0, updated: 0, errors: 0 };
  
  for (const repo of allRepos) {
    const result = await saveGitHubRepo(repo);
    if (result.action === 'created') results.created++;
    else if (result.action === 'updated') results.updated++;
    else results.errors++;
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  return results;
}

async function updateTrendingScores() {
  console.log('\n=== Updating Trending Scores ===\n');
  
  const tools = await prisma.tool.findMany({ where: { isActive: true } });
  
  for (const tool of tools) {
    const githubScore = Math.log((tool.githubStars || 0) + 1) * 15;
    const phScore = (tool.productHuntVotes || 0) * 3;
    const daysSinceAdded = Math.floor((Date.now() - tool.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const freshnessScore = daysSinceAdded < 7 ? 30 : daysSinceAdded < 30 ? 15 : 0;
    const baseScore = 10;
    
    const newScore = Math.min(100, Math.round(
      githubScore * 0.4 + phScore * 0.3 + freshnessScore * 0.2 + baseScore * 0.1
    ));
    
    if (Math.abs(newScore - tool.trendingScore) > 1) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: { trendingScore: newScore }
      });
    }
  }
  
  console.log(`Updated scores for ${tools.length} tools`);
}

async function main() {
  console.log('========================================');
  console.log('AI Tools Discovery - Daily Cron Job');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('========================================\n');
  
  const githubResults = await discoverFromGitHub();
  await updateTrendingScores();
  
  const totalTools = await prisma.tool.count({ where: { isActive: true } });
  
  console.log('\n========================================');
  console.log('Summary');
  console.log('========================================');
  console.log(`GitHub: ${githubResults.created} created, ${githubResults.updated} updated`);
  console.log(`Total active tools: ${totalTools}`);
  console.log(`Finished: ${new Date().toISOString()}`);
  console.log('========================================\n');
  
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

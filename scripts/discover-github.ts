/**
 * GitHub AI Tools Discovery
 * Searches GitHub for popular AI-related repositories
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

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

// Search queries for AI tools
const SEARCH_QUERIES = [
  'ai tools language:TypeScript stars:>100',
  'ai tools language:Python stars:>100',
  'chatgpt clone stars:>50',
  'ai image generator stars:>50',
  'ai writing assistant stars:>50',
  'llm tools stars:>50',
  'openai alternative stars:>50',
  'ai chatbot stars:>50',
];

async function searchGitHub(query: string, perPage: number = 30): Promise<GitHubRepo[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Atooli-Discovery/1.0'
    }
  });
  
  if (!response.ok) {
    console.error(`GitHub API error: ${response.status} ${response.statusText}`);
    return [];
  }
  
  const data = await response.json();
  return data.items || [];
}

function categorizeTool(repo: GitHubRepo): string {
  const topics = repo.topics || [];
  const desc = (repo.description || '').toLowerCase();
  
  if (topics.includes('image') || desc.includes('image') || desc.includes('photo')) {
    return 'Image';
  }
  if (topics.includes('chat') || desc.includes('chat') || desc.includes('chatbot')) {
    return 'Chat';
  }
  if (topics.includes('writing') || desc.includes('write') || desc.includes('text')) {
    return 'Writing';
  }
  if (topics.includes('code') || desc.includes('code') || repo.language === 'TypeScript' || repo.language === 'Python') {
    return 'Code';
  }
  if (topics.includes('audio') || desc.includes('audio') || desc.includes('voice')) {
    return 'Audio';
  }
  if (topics.includes('video') || desc.includes('video')) {
    return 'Video';
  }
  
  return 'Other';
}

function determinePricing(repo: GitHubRepo): 'FREE' | 'FREEMIUM' | 'PAID' | 'OPEN_SOURCE' {
  // Most GitHub repos with AI tools are open source
  if (repo.stargazers_count > 1000) {
    return 'OPEN_SOURCE';
  }
  return 'FREE';
}

async function saveRepo(repo: GitHubRepo) {
  try {
    const website = repo.homepage || repo.html_url;
    
    // Filter out Chinese/non-international sites
    if (isBlocked(website, repo.full_name)) {
      console.log(`⏭️ Skipping (blocked domain): ${repo.name}`);
      return;
    }
    
    // Skip if already exists
    const existing = await prisma.tool.findFirst({
      where: {
        OR: [
          { website: website },
          { slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
        ]
      }
    });
    
    if (existing) {
      // Update stars if exists
      await prisma.tool.update({
        where: { id: existing.id },
        data: { 
          githubStars: repo.stargazers_count,
          updatedAt: new Date()
        }
      });
      console.log(`Updated: ${repo.name} (${repo.stargazers_count} stars)`);
      return;
    }
    
    // Find or create category
    const categoryName = categorizeTool(repo);
    let category = await prisma.category.findFirst({
      where: { name: categoryName }
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: {
          slug: categoryName.toLowerCase(),
          name: categoryName,
          description: `${categoryName} AI tools`,
        }
      });
    }
    
    // Create tool
    await prisma.tool.create({
      data: {
        slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        name: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        tagline: repo.description?.substring(0, 100) || 'AI-powered tool',
        description: repo.description || '',
        website: website,
        categoryId: category.id,
        pricingTier: determinePricing(repo),
        githubStars: repo.stargazers_count,
        isActive: true,
        trendingScore: Math.min(100, repo.stargazers_count / 100),
      }
    });
    
    console.log(`Created: ${repo.name} (${repo.stargazers_count} stars)`);
    
  } catch (error) {
    console.error(`Error saving ${repo.name}:`, error);
  }
}

async function main() {
  console.log('Starting GitHub AI tools discovery...');
  console.log(`Token: ${GITHUB_TOKEN?.substring(0, 10)}...`);
  
  const allRepos: GitHubRepo[] = [];
  const seenIds = new Set<number>();
  
  for (const query of SEARCH_QUERIES) {
    console.log(`\nSearching: ${query}`);
    const repos = await searchGitHub(query, 15);
    
    for (const repo of repos) {
      if (!seenIds.has(repo.id)) {
        seenIds.add(repo.id);
        allRepos.push(repo);
      }
    }
    
    // Rate limit: wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\nFound ${allRepos.length} unique repositories`);
  console.log('Saving to database...\n');
  
  // Sort by stars and take top 100
  const topRepos = allRepos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 100);
  
  for (const repo of topRepos) {
    await saveRepo(repo);
    // Small delay to not overwhelm DB
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\nDiscovery complete!');
  await prisma.$disconnect();
}

main().catch(console.error);

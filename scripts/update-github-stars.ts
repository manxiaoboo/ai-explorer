/**
 * Update GitHub stars for all tools
 * For commercial products without public GitHub repos, uses alternative metrics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

// Commercial tools without public GitHub repos
// Using user count as a proxy metric (divided by 10 to approximate "star equivalent")
// NOTE: Names must match exactly with database records
const COMMERCIAL_TOOLS: Record<string, { stars: number; source: string }> = {
  'GitHub Copilot': { 
    stars: 2000000, // 20M users / 10 as proxy
    source: '20M users (Microsoft FY2025 report)' 
  },
  'ChatGPT': {
    stars: 70000000, // 700M weekly active users / 10
    source: '700M weekly active users (OpenAI Sep 2025)'
  },
  'Midjourney': {
    stars: 2000000, // 19.83M registered users / 10
    source: '19.83M registered users (Discord 2026)'
  },
  'Claude': {
    stars: 1890000, // 18.9M monthly active users / 10
    source: '18.9M monthly active users (Anthropic 2025)'
  },
  'Perplexity AI': {  // Changed from 'Perplexity'
    stars: 1500000, // 15M users / 10 (estimated based on growth reports)
    source: '~15M users (estimated 2025)'
  },
  'Notion AI': {
    stars: 3000000, // 30M+ users, assume ~50% use AI features / 10
    source: '30M+ users (Notion 2024)'
  },
  'Jasper': {
    stars: 100000, // 1M+ users / 10
    source: '1M+ users (Jasper 2024)'
  },
  'Copy.ai': {
    stars: 100000, // 10M+ users / 100 (lower engagement) 
    source: '10M+ users (Copy.ai 2024)'
  },
  'Grammarly': {
    stars: 3000000, // 30M daily active users / 10
    source: '30M daily active users (Grammarly 2024)'
  },
  'Cursor': {
    stars: 400000, // 4M+ users / 10 (fastest growing AI code editor)
    source: '4M+ users (Cursor 2025)'
  },
  'Runway ML': {
    stars: 200000, // 2M+ users / 10
    source: '2M+ users (Runway 2024)'
  },
  'Sora': {
    stars: 1000000, // 10M+ waitlist/users / 10 (OpenAI video model)
    source: '10M+ users (OpenAI 2025)'
  },
  'Google Gemini': {  // Changed from 'Gemini'
    stars: 3500000, // 35M+ users / 10 (Google AI)
    source: '35M+ users (Google 2025)'
  },
  'Poe': {
    stars: 180000, // 1.8M monthly active / 10 (Quora's AI chat)
    source: '1.8M monthly active (Poe 2024)'
  },
  'Character.AI': {
    stars: 600000, // 6M+ active users / 10
    source: '6M+ active users (Character.AI 2024)'
  },
};

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

// Check if a URL should be filtered out
function isBlocked(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return BLOCKED_DOMAINS.some(domain => lowerUrl.includes(domain));
}

async function updateGitHubStars() {
  const tools = await prisma.tool.findMany({
    where: {
      website: {
        contains: 'github.com'
      },
      isActive: true
    },
    take: 100 // Batch size
  });
  
  // Filter out Chinese/non-international sites
  const filteredTools = tools.filter(tool => !isBlocked(tool.website));
  
  console.log(`Updating ${filteredTools.length} tools (filtered from ${tools.length})...`);
  
  for (const tool of filteredTools) {
    try {
      // Check if this is a commercial tool with predefined metrics
      const commercialTool = COMMERCIAL_TOOLS[tool.name];
      if (commercialTool) {
        await prisma.tool.update({
          where: { id: tool.id },
          data: { 
            githubStars: commercialTool.stars,
            updatedAt: new Date()
          }
        });
        console.log(`✓ ${tool.name}: ${commercialTool.stars.toLocaleString()} stars (${commercialTool.source})`);
        continue;
      }
      
      // Extract owner/repo from GitHub URL
      const match = tool.website.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) continue;
      
      const [, owner, repo] = match;
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Atooli-Updater/1.0'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ Repository not found: ${tool.name} (${tool.website})`);
          // Check if this tool might be a commercial product we should add to the list
          console.log(`   Hint: If ${tool.name} is a commercial product without a public repo, add it to COMMERCIAL_TOOLS`);
        } else {
          console.error(`API error for ${tool.name}: ${response.status}`);
        }
        continue;
      }
      
      const data = await response.json();
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: { 
          githubStars: data.stargazers_count,
          updatedAt: new Date()
        }
      });
      
      console.log(`✓ ${tool.name}: ${data.stargazers_count.toLocaleString()} stars`);
      
      // Rate limiting: max 5000 requests/hour for authenticated users
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error updating ${tool.name}:`, error);
    }
  }
}

// Also update commercial tools that may not have github.com in their website
async function updateCommercialTools() {
  console.log('\nChecking commercial tools...');
  
  for (const [toolName, data] of Object.entries(COMMERCIAL_TOOLS)) {
    try {
      const tool = await prisma.tool.findFirst({
        where: { name: toolName }
      });
      
      if (tool) {
        await prisma.tool.update({
          where: { id: tool.id },
          data: { 
            githubStars: data.stars,
            updatedAt: new Date()
          }
        });
        console.log(`✓ ${toolName}: ${data.stars.toLocaleString()} stars (${data.source})`);
      } else {
        console.log(`⚠️ Tool not found in database: ${toolName}`);
      }
    } catch (error) {
      console.error(`Error updating ${toolName}:`, error);
    }
  }
}

// Main execution
async function main() {
  await updateGitHubStars();
  await updateCommercialTools();
  console.log('\nUpdate complete!');
  await prisma.$disconnect();
}

main().catch(console.error);

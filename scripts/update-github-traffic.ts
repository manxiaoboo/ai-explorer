/**
 * GitHub Traffic Metrics Updater
 * Fetches traffic data (views, clones) for GitHub repositories
 * Replaces HuggingFace metrics since HF is not accessible
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

interface GitHubTrafficData {
  views: {
    count: number;
    uniques: number;
  };
  clones: {
    count: number;
    uniques: number;
  };
}

async function fetchGitHubTraffic(owner: string, repo: string): Promise<GitHubTrafficData | null> {
  try {
    // Fetch views
    const viewsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/traffic/views`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Atooli-Updater/1.0'
      }
    });
    
    // Fetch clones
    const clonesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/traffic/clones`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Atooli-Updater/1.0'
      }
    });
    
    if (!viewsResponse.ok || !clonesResponse.ok) {
      if (viewsResponse.status === 404 || clonesResponse.status === 404) {
        console.log(`Repository not found or no traffic data: ${owner}/${repo}`);
      } else if (viewsResponse.status === 403 || clonesResponse.status === 403) {
        console.log(`No permission for traffic data: ${owner}/${repo} (need push access)`);
      } else {
        console.error(`GitHub API error for ${owner}/${repo}: views=${viewsResponse.status}, clones=${clonesResponse.status}`);
      }
      return null;
    }
    
    const viewsData = await viewsResponse.json();
    const clonesData = await clonesResponse.json();
    
    return {
      views: {
        count: viewsData.count || 0,
        uniques: viewsData.uniques || 0
      },
      clones: {
        count: clonesData.count || 0,
        uniques: clonesData.uniques || 0
      }
    };
    
  } catch (error) {
    console.error(`Error fetching traffic for ${owner}/${repo}:`, error);
    return null;
  }
}

async function updateGitHubTraffic() {
  // Find tools with GitHub repos
  const tools = await prisma.tool.findMany({
    where: {
      website: {
        contains: 'github.com'
      },
      isActive: true
    },
    take: 50 // Limit to avoid rate limiting
  });
  
  console.log(`Checking GitHub traffic for ${tools.length} tools...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const tool of tools) {
    try {
      // Extract owner/repo from GitHub URL
      const match = tool.website.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) continue;
      
      const [, owner, repo] = match;
      
      const traffic = await fetchGitHubTraffic(owner, repo);
      if (!traffic) {
        failCount++;
        continue;
      }
      
      // Store traffic data in description or use it to calculate trending
      // For now, just log it
      console.log(`✓ ${tool.name}: ${traffic.views.count.toLocaleString()} views, ${traffic.clones.count.toLocaleString()} clones`);
      successCount++;
      
      // Rate limiting - traffic API has stricter limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error updating ${tool.name}:`, error);
      failCount++;
    }
  }
  
  console.log(`\nGitHub traffic update complete: ${successCount} succeeded, ${failCount} failed`);
  console.log('Note: Traffic data requires push access to the repository');
}

async function main() {
  console.log('=== GitHub Traffic Metrics Updater ===\n');
  console.log('Note: This replaces HuggingFace metrics since HF is not accessible\n');
  
  await updateGitHubTraffic();
  
  console.log('\n=== Done ===');
  await prisma.$disconnect();
}

main().catch(console.error);

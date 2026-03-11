/**
 * GitHub Stats Updater
 * 
 * Fetches GitHub star counts and calculates 7-day growth for tools with GitHub repos.
 * Should run daily via cron.
 */

import { prisma } from "./lib/prisma";

interface GitHubRepoInfo {
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
}

async function fetchGitHubStats(repoUrl: string): Promise<GitHubRepoInfo | null> {
  try {
    // Extract owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");
    
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}`,
      {
        headers: {
          "Accept": "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN && {
            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`  Repository not found: ${owner}/${cleanRepo}`);
      } else if (response.status === 403) {
        console.log(`  Rate limited. Consider adding GITHUB_TOKEN.`);
      } else {
        console.log(`  GitHub API error: ${response.status}`);
      }
      return null;
    }
    
    const data = await response.json();
    
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error(`  Failed to fetch GitHub stats:`, error);
    return null;
  }
}

async function updateGitHubStats() {
  console.log("🐙 Starting GitHub stats update...\n");
  
  // Get tools with GitHub repos
  const tools = await prisma.tool.findMany({
    where: {
      isActive: true,
      githubRepo: { not: null },
    },
  });
  
  console.log(`📊 Found ${tools.length} tools with GitHub repos\n`);
  
  let updated = 0;
  let errors = 0;
  let skipped = 0;
  
  for (const tool of tools) {
    if (!tool.githubRepo) continue;
    
    console.log(`🔍 ${tool.name}`);
    
    const stats = await fetchGitHubStats(tool.githubRepo);
    
    if (!stats) {
      errors++;
      continue;
    }
    
    // Calculate 7-day growth if we have previous data
    let growth7d = tool.githubStarsGrowth7d || 0;
    if (tool.githubStars && tool.githubStars > 0) {
      const diff = stats.stars - tool.githubStars;
      // Only update growth if stars increased (avoid negative from unstars)
      if (diff > 0) {
        growth7d = diff;
      }
    }
    
    // Update tool
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        githubStars: stats.stars,
        githubStarsGrowth7d: growth7d,
      },
    });
    
    console.log(`  ⭐ ${stats.stars.toLocaleString()} stars (${growth7d > 0 ? `+${growth7d}` : growth7d} this week)`);
    updated++;
    
    // Rate limiting: max 60 requests per hour without auth, 5000 with auth
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  console.log(`\n✅ Updated ${updated} tools`);
  if (errors > 0) console.log(`❌ ${errors} errors`);
}

// Run if executed directly
if (require.main === module) {
  updateGitHubStats()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to update GitHub stats:", error);
      process.exit(1);
    });
}

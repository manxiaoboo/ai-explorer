/**
 * GitHub Stats Updater (Local)
 * 
 * 在本地运行，更新远程数据库中的 GitHub 统计
 */

import { prisma } from "./lib/db";

interface GitHubRepoInfo {
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
}

async function fetchGitHubStats(repoUrl: string): Promise<GitHubRepoInfo | null> {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.log(`    ⚠️ Rate limited. Set GITHUB_TOKEN to increase limit.`);
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
    console.error(`    ❌ Failed to fetch:`, error);
    return null;
  }
}

async function updateGitHubStats() {
  console.log("🐙 GitHub Stats Update (Local)");
  console.log("================================\n");

  // 获取有 GitHub 仓库的工具
  const tools = await prisma.tool.findMany({
    where: {
      isActive: true,
      githubRepo: { not: null },
    },
    select: {
      id: true,
      name: true,
      githubRepo: true,
      githubStars: true,
    },
  });

  console.log(`Found ${tools.length} tools with GitHub repos\n`);

  let updated = 0;
  let errors = 0;

  for (const tool of tools) {
    if (!tool.githubRepo) continue;

    process.stdout.write(`🔍 ${tool.name}... `);

    const stats = await fetchGitHubStats(tool.githubRepo);

    if (!stats) {
      console.log("❌");
      errors++;
      continue;
    }

    // 计算 7 天增长
    let growth7d = 0;
    if (tool.githubStars && tool.githubStars > 0) {
      const diff = stats.stars - tool.githubStars;
      if (diff > 0) growth7d = diff;
    }

    // 更新数据库
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        githubStars: stats.stars,
        githubStarsGrowth7d: growth7d,
      },
    });

    console.log(`✅ ${stats.stars.toLocaleString()} stars (+${growth7d})`);
    updated++;

    // 限速：每秒 1 个请求
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n📊 Summary: ${updated} updated, ${errors} errors`);
}

// 运行
updateGitHubStats()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("\n❌ Fatal error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

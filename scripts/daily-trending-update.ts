/**
 * Daily Trending Update
 * 
 * Orchestrates all trending-related updates:
 * 1. Update GitHub stats
 * 2. Update HuggingFace stats  
 * 3. Update Product Hunt stats
 * 4. Calculate trending scores
 * 5. Reset 7-day counters
 * 
 * Should run daily at midnight via cron.
 */

import { prisma } from "./lib/prisma";

// Import update functions
async function updateGitHubStats() {
  console.log("\n📦 Step 1: GitHub Stats");
  console.log("========================");
  
  const tools = await prisma.tool.findMany({
    where: { isActive: true, githubRepo: { not: null } },
  });
  
  let updated = 0;
  
  for (const tool of tools) {
    if (!tool.githubRepo) continue;
    
    try {
      const match = tool.githubRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) continue;
      
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
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      let growth7d = tool.githubStarsGrowth7d || 0;
      if (tool.githubStars && tool.githubStars > 0) {
        const diff = data.stargazers_count - tool.githubStars;
        if (diff > 0) growth7d = diff;
      }
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: {
          githubStars: data.stargazers_count,
          githubStarsGrowth7d: growth7d,
        },
      });
      
      updated++;
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error(`  Failed: ${tool.name}`);
    }
  }
  
  console.log(`✅ Updated ${updated}/${tools.length} tools`);
}

async function updateHFStats() {
  console.log("\n📦 Step 2: HuggingFace Stats");
  console.log("=============================");
  
  const tools = await prisma.tool.findMany({
    where: { isActive: true, hfModelId: { not: null } },
  });
  
  let updated = 0;
  
  for (const tool of tools) {
    if (!tool.hfModelId) continue;
    
    try {
      const response = await fetch(
        `https://huggingface.co/api/models/${tool.hfModelId}`
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      let growth7d = tool.hfDownloadsGrowth7d || 0;
      if (tool.hfDownloads && tool.hfDownloads > 0) {
        const diff = (data.downloads || 0) - tool.hfDownloads;
        if (diff > 0) growth7d = diff;
      }
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: {
          hfDownloads: data.downloads || 0,
          hfDownloadsGrowth7d: growth7d,
          hfLikes: data.likes || 0,
        },
      });
      
      updated++;
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.error(`  Failed: ${tool.name}`);
    }
  }
  
  console.log(`✅ Updated ${updated}/${tools.length} tools`);
}

async function calculateTrendingScores() {
  console.log("\n📦 Step 3: Calculate Trending Scores");
  console.log("=====================================");
  
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
  });
  
  const BENCHMARKS = {
    githubStars: 5000,
    githubGrowth: 100,
    productHuntVotes: 500,
    hfDownloads: 10000,
    hfLikes: 500,
    clicks7d: 100,
    saves: 50,
  };
  
  const normalize = (value: number, benchmark: number) => {
    if (value <= 0) return 0;
    return Math.min((Math.log10(value + 1) / Math.log10(benchmark + 1)) * 100, 100);
  };
  
  let updated = 0;
  const topTools: Array<{ name: string; score: number }> = [];
  
  for (const tool of tools) {
    // GitHub Score (25%)
    let githubScore = 0;
    if (tool.githubStars && tool.githubStars >= 10) {
      const baseScore = normalize(tool.githubStars, BENCHMARKS.githubStars);
      const growthScore = tool.githubStarsGrowth7d && tool.githubStarsGrowth7d > 0
        ? normalize(tool.githubStarsGrowth7d, BENCHMARKS.githubGrowth) * 0.3
        : 0;
      const trendingBonus = tool.githubStarsGrowth7d && tool.githubStarsGrowth7d > 50 ? 10 : 0;
      githubScore = Math.min(baseScore + growthScore + trendingBonus, 100);
    }
    
    // Product Hunt Score (20%)
    const productHuntScore = tool.productHuntVotes && tool.productHuntVotes >= 5
      ? normalize(tool.productHuntVotes, BENCHMARKS.productHuntVotes)
      : 0;
    
    // HF Score (15%)
    let hfScore = 0;
    if (tool.hfDownloads || tool.hfLikes) {
      const downloadScore = tool.hfDownloads
        ? normalize(tool.hfDownloads, BENCHMARKS.hfDownloads) * 0.6
        : 0;
      const likeScore = tool.hfLikes
        ? normalize(tool.hfLikes, BENCHMARKS.hfLikes) * 0.4
        : 0;
      hfScore = Math.min(downloadScore + likeScore, 100);
    }
    
    // Engagement Score (25%)
    const clickScore = normalize(tool.clickCount7d, BENCHMARKS.clicks7d) * 0.7;
    const saveScore = normalize(tool.saveCount, BENCHMARKS.saves) * 0.3;
    const engagementScore = Math.min(clickScore + saveScore, 100);
    
    // Freshness Score (10%)
    const daysSinceCreation = Math.floor(
      (Date.now() - tool.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    let freshnessScore = 0;
    if (daysSinceCreation <= 7) freshnessScore = 100;
    else if (daysSinceCreation <= 30) freshnessScore = 70;
    else if (daysSinceCreation <= 90) freshnessScore = 40;
    else if (daysSinceCreation <= 180) freshnessScore = 20;
    
    // Quality Score (5%)
    let qualityScore = 0;
    if (tool.description) {
      const descLength = tool.description.length;
      if (descLength > 500) qualityScore += 30;
      else if (descLength > 300) qualityScore += 20;
      else if (descLength > 100) qualityScore += 10;
    }
    if (tool.features?.length > 0) qualityScore += Math.min(tool.features.length * 5, 20);
    if (tool.useCases?.length > 0) qualityScore += Math.min(tool.useCases.length * 5, 20);
    if (tool.logo) qualityScore += 15;
    if (tool.githubRepo || tool.hfModelId) qualityScore += 15;
    qualityScore = Math.min(qualityScore, 100);
    
    // Final score
    const finalScore = Math.round((
      githubScore * 0.25 +
      productHuntScore * 0.20 +
      hfScore * 0.15 +
      engagementScore * 0.25 +
      freshnessScore * 0.10 +
      qualityScore * 0.05
    ) * 100) / 100;
    
    await prisma.tool.update({
      where: { id: tool.id },
      data: { trendingScore: finalScore },
    });
    
    updated++;
    
    if (finalScore > 70) {
      topTools.push({ name: tool.name, score: finalScore });
    }
  }
  
  topTools.sort((a, b) => b.score - a.score);
  
  console.log(`✅ Updated ${updated} tools`);
  console.log(`\n🔥 Top Trending:`);
  topTools.slice(0, 10).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name} (${t.score.toFixed(1)})`);
  });
}

async function resetWeeklyCounters() {
  console.log("\n📦 Step 4: Reset Weekly Counters");
  console.log("=================================");
  
  // Reset 7-day click counts
  const result = await prisma.tool.updateMany({
    data: {
      clickCount7d: 0,
      githubStarsGrowth7d: 0,
      hfDownloadsGrowth7d: 0,
    },
  });
  
  console.log(`✅ Reset counters for ${result.count} tools`);
}

async function main() {
  const startTime = Date.now();
  
  console.log("🚀 Daily Trending Update Started");
  console.log(`📅 ${new Date().toISOString()}\n`);
  
  try {
    await updateGitHubStats();
    await updateHFStats();
    await calculateTrendingScores();
    await resetWeeklyCounters();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✨ Completed in ${duration}s`);
    
  } catch (error) {
    console.error("\n❌ Update failed:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

/**
 * Trending Score Calculator (Local)
 * 
 * 在本地运行，计算并更新所有工具的 trendingScore
 */

import { prisma } from "./lib/db";

// Benchmarks for normalization
const BENCHMARKS = {
  githubStars: 5000,
  githubGrowth: 100,
  productHuntVotes: 500,
  hfDownloads: 10000,
  hfLikes: 500,
  clicks7d: 100,
  saves: 50,
};

function normalize(value: number, benchmark: number): number {
  if (value <= 0) return 0;
  return Math.min((Math.log10(value + 1) / Math.log10(benchmark + 1)) * 100, 100);
}

function calculateToolScore(tool: any): number {
  // 1. GitHub Score (25%)
  let githubScore = 0;
  if (tool.githubStars && tool.githubStars >= 10) {
    const baseScore = normalize(tool.githubStars, BENCHMARKS.githubStars);
    const growthScore = tool.githubStarsGrowth7d && tool.githubStarsGrowth7d > 0
      ? normalize(tool.githubStarsGrowth7d, BENCHMARKS.githubGrowth) * 0.3
      : 0;
    const trendingBonus = tool.githubStarsGrowth7d && tool.githubStarsGrowth7d > 50 ? 10 : 0;
    githubScore = Math.min(baseScore + growthScore + trendingBonus, 100);
  }

  // 2. Product Hunt Score (20%)
  const productHuntScore = tool.productHuntVotes && tool.productHuntVotes >= 5
    ? normalize(tool.productHuntVotes, BENCHMARKS.productHuntVotes)
    : 0;

  // 3. HF Score (15%)
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

  // 4. Engagement Score (25%)
  const clickScore = normalize(tool.clickCount7d || 0, BENCHMARKS.clicks7d) * 0.7;
  const saveScore = normalize(tool.saveCount || 0, BENCHMARKS.saves) * 0.3;
  const engagementScore = Math.min(clickScore + saveScore, 100);

  // 5. Freshness Score (10%)
  const daysSinceCreation = Math.floor(
    (Date.now() - tool.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  let freshnessScore = 0;
  if (daysSinceCreation <= 7) freshnessScore = 100;
  else if (daysSinceCreation <= 30) freshnessScore = 70;
  else if (daysSinceCreation <= 90) freshnessScore = 40;
  else if (daysSinceCreation <= 180) freshnessScore = 20;

  // 6. Quality Score (5%)
  let qualityScore = 0;
  if (tool.description) {
    const len = tool.description.length;
    if (len > 500) qualityScore += 30;
    else if (len > 300) qualityScore += 20;
    else if (len > 100) qualityScore += 10;
  }
  if (tool.features?.length > 0) qualityScore += Math.min(tool.features.length * 5, 20);
  if (tool.useCases?.length > 0) qualityScore += Math.min(tool.useCases.length * 5, 20);
  if (tool.logo) qualityScore += 15;
  if (tool.githubRepo || tool.hfModelId) qualityScore += 15;
  qualityScore = Math.min(qualityScore, 100);

  // Final weighted score
  const finalScore =
    githubScore * 0.25 +
    productHuntScore * 0.20 +
    hfScore * 0.15 +
    engagementScore * 0.25 +
    freshnessScore * 0.10 +
    qualityScore * 0.05;

  return Math.round(finalScore * 100) / 100;
}

async function calculateTrendingScores() {
  console.log("📊 Trending Score Calculator (Local)");
  console.log("======================================\n");

  const startTime = Date.now();

  const tools = await prisma.tool.findMany({
    where: { isActive: true },
  });

  console.log(`Found ${tools.length} active tools\n`);

  let updated = 0;
  const topTools: Array<{ name: string; score: number }> = [];

  for (const tool of tools) {
    const score = calculateToolScore(tool);

    await prisma.tool.update({
      where: { id: tool.id },
      data: { trendingScore: score },
    });

    updated++;

    if (score > 70) {
      topTools.push({ name: tool.name, score });
    }

    // 每 50 个显示一次进度
    if (updated % 50 === 0) {
      process.stdout.write(`  ${updated}/${tools.length}...\r`);
    }
  }

  console.log(`  ${updated}/${tools.length}... ✓\n`);

  // 排序并显示 Top 10
  topTools.sort((a, b) => b.score - a.score);

  console.log("🔥 Top 10 Trending:");
  topTools.slice(0, 10).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name} (${t.score.toFixed(1)})`);
  });

  const hotCount = await prisma.tool.count({
    where: { isActive: true, trendingScore: { gte: 80 } },
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n📈 Summary:`);
  console.log(`  Updated: ${updated} tools`);
  console.log(`  Hot (80+): ${hotCount} tools`);
  console.log(`  Duration: ${duration}s`);
}

calculateTrendingScores()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("\n❌ Fatal error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

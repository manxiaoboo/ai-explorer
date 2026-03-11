/**
 * Trending Score Calculation Algorithm
 * 
 * Score Components (0-100 scale):
 * - GitHub Popularity (25%): Stars + growth rate
 * - Product Hunt (20%): Votes + engagement
 * - HuggingFace (15%): Downloads + likes
 * - User Engagement (25%): Clicks (7d) + saves
 * - Freshness (10%): New tool boost
 * - Quality Signals (5%): Completeness
 */

import { prisma } from "./lib/prisma";

interface ScoreWeights {
  github: number;
  productHunt: number;
  huggingface: number;
  engagement: number;
  freshness: number;
  quality: number;
}

const WEIGHTS: ScoreWeights = {
  github: 0.25,
  productHunt: 0.20,
  huggingface: 0.15,
  engagement: 0.25,
  freshness: 0.10,
  quality: 0.05,
};

// Benchmark values for normalization (90th percentile targets)
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
  // Use log scale for better distribution
  const score = Math.log10(value + 1) / Math.log10(benchmark + 1);
  return Math.min(score * 100, 100); // Cap at 100
}

function calculateGitHubScore(
  stars: number | null,
  growth7d: number | null
): number {
  if (!stars || stars < 10) return 0;
  
  const baseScore = normalize(stars, BENCHMARKS.githubStars);
  const growthScore = growth7d && growth7d > 0
    ? normalize(growth7d, BENCHMARKS.githubGrowth) * 0.3
    : 0;
  
  // Bonus for trending repos (high recent growth)
  const trendingBonus = growth7d && growth7d > 50 ? 10 : 0;
  
  return Math.min(baseScore + growthScore + trendingBonus, 100);
}

function calculateProductHuntScore(votes: number | null): number {
  if (!votes || votes < 5) return 0;
  return normalize(votes, BENCHMARKS.productHuntVotes);
}

function calculateHuggingFaceScore(
  downloads: number | null,
  likes: number | null
): number {
  const downloadScore = downloads 
    ? normalize(downloads, BENCHMARKS.hfDownloads) * 0.6
    : 0;
  const likeScore = likes
    ? normalize(likes, BENCHMARKS.hfLikes) * 0.4
    : 0;
  
  return Math.min(downloadScore + likeScore, 100);
}

function calculateEngagementScore(
  clicks7d: number,
  saves: number
): number {
  const clickScore = normalize(clicks7d, BENCHMARKS.clicks7d) * 0.7;
  const saveScore = normalize(saves, BENCHMARKS.saves) * 0.3;
  
  return Math.min(clickScore + saveScore, 100);
}

function calculateFreshnessScore(createdAt: Date): number {
  const daysSinceCreation = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // New tools get a boost that decays over time
  if (daysSinceCreation <= 7) {
    return 100; // Full boost for first week
  } else if (daysSinceCreation <= 30) {
    return 70; // 70% boost for first month
  } else if (daysSinceCreation <= 90) {
    return 40; // 40% boost for first quarter
  } else if (daysSinceCreation <= 180) {
    return 20; // 20% boost for first half year
  }
  
  return 0; // No freshness bonus after 6 months
}

function calculateQualityScore(tool: any): number {
  let score = 0;
  
  // Description length (max 30 points)
  if (tool.description) {
    const descLength = tool.description.length;
    if (descLength > 500) score += 30;
    else if (descLength > 300) score += 20;
    else if (descLength > 100) score += 10;
  }
  
  // Features list (max 20 points)
  if (tool.features && tool.features.length > 0) {
    score += Math.min(tool.features.length * 5, 20);
  }
  
  // Use cases (max 20 points)
  if (tool.useCases && tool.useCases.length > 0) {
    score += Math.min(tool.useCases.length * 5, 20);
  }
  
  // Logo present (15 points)
  if (tool.logo) score += 15;
  
  // GitHub or HF link (15 points)
  if (tool.githubRepo || tool.hfModelId) score += 15;
  
  return Math.min(score, 100);
}

function calculateFinalScore(
  githubScore: number,
  productHuntScore: number,
  hfScore: number,
  engagementScore: number,
  freshnessScore: number,
  qualityScore: number
): number {
  const weightedScore =
    githubScore * WEIGHTS.github +
    productHuntScore * WEIGHTS.productHunt +
    hfScore * WEIGHTS.huggingface +
    engagementScore * WEIGHTS.engagement +
    freshnessScore * WEIGHTS.freshness +
    qualityScore * WEIGHTS.quality;
  
  // Round to 2 decimal places
  return Math.round(weightedScore * 100) / 100;
}

export async function calculateTrendingScores() {
  console.log("🚀 Starting trending score calculation...\n");
  
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
  });
  
  console.log(`📊 Found ${tools.length} active tools\n`);
  
  let updated = 0;
  let errors = 0;
  
  for (const tool of tools) {
    try {
      // Calculate component scores
      const githubScore = calculateGitHubScore(
        tool.githubStars,
        tool.githubStarsGrowth7d
      );
      
      const productHuntScore = calculateProductHuntScore(
        tool.productHuntVotes
      );
      
      const hfScore = calculateHuggingFaceScore(
        tool.hfDownloads,
        tool.hfLikes
      );
      
      const engagementScore = calculateEngagementScore(
        tool.clickCount7d,
        tool.saveCount
      );
      
      const freshnessScore = calculateFreshnessScore(tool.createdAt);
      
      const qualityScore = calculateQualityScore(tool);
      
      const finalScore = calculateFinalScore(
        githubScore,
        productHuntScore,
        hfScore,
        engagementScore,
        freshnessScore,
        qualityScore
      );
      
      // Update tool
      await prisma.tool.update({
        where: { id: tool.id },
        data: { trendingScore: finalScore },
      });
      
      updated++;
      
      // Log top tools
      if (finalScore > 70) {
        console.log(`🔥 ${tool.name}: ${finalScore.toFixed(2)}`);
        console.log(`   GitHub: ${githubScore.toFixed(1)} | PH: ${productHuntScore.toFixed(1)} | HF: ${hfScore.toFixed(1)} | Eng: ${engagementScore.toFixed(1)} | Fresh: ${freshnessScore.toFixed(1)} | Quality: ${qualityScore.toFixed(1)}`);
      }
    } catch (error) {
      console.error(`❌ Failed to calculate score for ${tool.name}:`, error);
      errors++;
    }
  }
  
  console.log(`\n✅ Updated ${updated} tools`);
  if (errors > 0) {
    console.log(`❌ ${errors} errors`);
  }
  
  // Show distribution
  const hotToolsCount = await prisma.tool.count({
    where: {
      isActive: true,
      trendingScore: { gte: 80 },
    },
  });
  
  console.log(`\n📈 ${hotToolsCount} tools scored 80+ (Hot/Trending)`);
}

// Run if executed directly
if (require.main === module) {
  calculateTrendingScores()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to calculate trending scores:", error);
      process.exit(1);
    });
}

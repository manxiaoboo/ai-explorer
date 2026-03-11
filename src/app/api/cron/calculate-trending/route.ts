import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/calculate-trending
 * 
 * Calculates trending scores for all active tools.
 * Should be called by a cron job every 6 hours.
 * 
 * Query params:
 * - secret: CRON_SECRET for authentication
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const startTime = Date.now();
    
    const tools = await prisma.tool.findMany({
      where: { isActive: true },
    });
    
    let updated = 0;
    const results: Array<{ name: string; score: number }> = [];
    
    for (const tool of tools) {
      const score = calculateToolScore(tool);
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: { trendingScore: score },
      });
      
      updated++;
      
      if (score > 70) {
        results.push({ name: tool.name, score });
      }
    }
    
    const duration = Date.now() - startTime;
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    
    return NextResponse.json({
      success: true,
      updated,
      duration: `${duration}ms`,
      topTools: results.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Failed to calculate trending scores:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Benchmark values for normalization
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
  
  // HuggingFace Score (15%)
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

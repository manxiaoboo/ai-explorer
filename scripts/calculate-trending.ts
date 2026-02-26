/**
 * Enhanced Trending Score Calculator - Fixed Version
 * Multi-dimensional scoring with balanced weights
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calculateTrendingScore(tool: any): number {
  // GitHub score (0-100) - log scale
  const githubScore = tool.githubStars 
    ? Math.min(100, Math.log10(tool.githubStars) * 20) 
    : 0;
  
  // Growth score (0-100)
  let growthScore = 0;
  if (tool.githubStarsGrowth7d && tool.githubStars) {
    growthScore = Math.min(100, (tool.githubStarsGrowth7d / tool.githubStars) * 2000);
  }
  
  // Product Hunt score (0-100) - FIXED: capped and balanced
  const phScore = tool.productHuntVotes 
    ? Math.min(100, 20 + Math.log10(tool.productHuntVotes / 50 + 1) * 25)
    : 0;
  
  // Hugging Face score
  const hfScore = tool.hfDownloads 
    ? Math.min(100, Math.log10(tool.hfDownloads + 1) * 12 + (tool.hfLikes || 0) / 30)
    : 0;
  
  // Platform engagement
  const engagementScore = Math.min(100, 
    Math.log10(tool.clickCount + 1) * 12 + tool.saveCount * 1.5
  );
  
  // Quality signals
  let qualityScore = 0;
  const hasHomepage = tool.website && !tool.website.includes('github.com');
  if (hasHomepage) qualityScore += 25;
  if (tool.description?.length > 200) qualityScore += 25;
  if (tool.githubStars > 0) qualityScore += 25;
  const daysOld = (Date.now() - tool.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld > 30 && daysOld < 365) qualityScore += 25;
  
  // Freshness
  let freshnessScore = 0;
  if (daysOld < 7) freshnessScore = 70;
  else if (daysOld < 30) freshnessScore = 40;
  else freshnessScore = 15;
  
  // Weighted sum
  return Math.min(100, Math.round(
    githubScore * 0.25 +      // 25% GitHub
    growthScore * 0.10 +      // 10% Growth
    phScore * 0.10 +          // 10% Product Hunt (REDUCED)
    hfScore * 0.05 +          // 5% HuggingFace
    engagementScore * 0.15 +  // 15% Platform engagement
    qualityScore * 0.20 +     // 20% Quality signals
    freshnessScore * 0.15     // 15% Freshness
  ));
}

async function recalculateAllScores() {
  console.log('🔄 Recalculating trending scores...\n');
  
  const tools = await prisma.tool.findMany({ 
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      trendingScore: true,
      githubStars: true,
      githubStarsGrowth7d: true,
      productHuntVotes: true,
      hfDownloads: true,
      hfLikes: true,
      clickCount: true,
      clickCount7d: true,
      saveCount: true,
      createdAt: true,
      website: true,
      description: true
    }
  });
  
  console.log(`Processing ${tools.length} tools...\n`);
  
  let updated = 0;
  
  for (const tool of tools) {
    const newScore = calculateTrendingScore(tool);
    
    if (Math.abs(newScore - tool.trendingScore) > 0.5) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: { trendingScore: newScore }
      });
      console.log(`${tool.name}: ${tool.trendingScore} → ${newScore}`);
      updated++;
    }
  }
  
  console.log(`\n✅ Updated ${updated} tools`);
  
  // Show stats
  const stats = await prisma.tool.aggregate({
    where: { isActive: true },
    _avg: { trendingScore: true },
    _max: { trendingScore: true },
    _min: { trendingScore: true }
  });
  
  console.log(`\n📊 Stats: Avg=${stats._avg.trendingScore?.toFixed(1)}, Max=${stats._max.trendingScore}, Min=${stats._min.trendingScore}`);
  
  // Top 10
  const top = await prisma.tool.findMany({
    where: { isActive: true },
    orderBy: { trendingScore: 'desc' },
    take: 10,
    select: { name: true, trendingScore: true, githubStars: true }
  });
  
  console.log('\n🏆 Top 10:');
  top.forEach((t, i) => console.log(`${i+1}. ${t.name}: ${t.trendingScore} (⭐${t.githubStars || 0})`));
}

recalculateAllScores()
  .then(() => prisma.$disconnect())
  .catch(console.error);

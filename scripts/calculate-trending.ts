/**
 * Calculate trending scores for all tools
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calculateTrendingScore(tool: {
  githubStars: number | null;
  productHuntVotes: number | null;
  createdAt: Date;
  trendingScore: number;
}): number {
  const githubWeight = 0.4;
  const productHuntWeight = 0.3;
  const freshnessWeight = 0.2;
  const baseWeight = 0.1;
  
  // GitHub score (logarithmic scale)
  const githubScore = Math.log((tool.githubStars || 0) + 1) * 15;
  
  // Product Hunt score
  const phScore = (tool.productHuntVotes || 0) * 3;
  
  // Freshness score (new tools get a boost)
  const daysSinceAdded = Math.floor(
    (Date.now() - tool.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const freshnessScore = daysSinceAdded < 7 ? 30 : daysSinceAdded < 30 ? 15 : 0;
  
  // Base score (prevents score from being 0)
  const baseScore = 10;
  
  return Math.min(100, Math.round(
    githubScore * githubWeight +
    phScore * productHuntWeight +
    freshnessScore * freshnessWeight +
    baseScore * baseWeight
  ));
}

async function recalculateAllScores() {
  const tools = await prisma.tool.findMany({
    where: { isActive: true }
  });
  
  console.log(`Recalculating scores for ${tools.length} tools...\n`);
  
  for (const tool of tools) {
    const newScore = calculateTrendingScore(tool);
    
    if (Math.abs(newScore - tool.trendingScore) > 1) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: { trendingScore: newScore }
      });
      
      console.log(`${tool.name}: ${tool.trendingScore} → ${newScore}`);
    }
  }
  
  console.log('\nRecalculation complete!');
}

recalculateAllScores()
  .then(() => prisma.$disconnect())
  .catch(console.error);

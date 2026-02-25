/**
 * Comprehensive Heat Score Calculator
 * Combines own metrics, GitHub, Hugging Face, and freshness
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Calculate 7-day click count from ToolClick table
async function getClickCount7d(toolId: string): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const count = await prisma.toolClick.count({
    where: {
      toolId,
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  });
  
  return count;
}

interface HeatMetrics {
  // Own platform (30%)
  clicks7d: number;
  saves: number;
  
  // GitHub (15%)
  githubStars: number;
  githubGrowth7d: number;
  
  // Hugging Face (15%)
  hfDownloads: number;
  hfLikes: number;
  hfGrowth7d: number;
  
  // Freshness (20%)
  daysSinceAdded: number;
  
  // Base (20%)
  baseScore: number;
}

function calculateHeatScore(m: HeatMetrics): number {
  // Own platform (30%) - clicks weighted more than saves
  const clickScore = Math.min(100, Math.log(m.clicks7d + 1) * 20);
  const saveScore = Math.min(50, m.saves * 2);
  const ownScore = Math.min(100, clickScore + saveScore);
  
  // GitHub (15%)
  const githubScore = Math.min(100, 
    Math.log((m.githubStars || 0) + 1) * 12 + 
    (m.githubGrowth7d || 0) * 2
  );
  
  // Hugging Face (15%)
  const hfScore = Math.min(100,
    Math.log((m.hfDownloads || 0) + 1) * 8 +
    (m.hfLikes || 0) * 0.3 +
    (m.hfGrowth7d || 0) * 0.01
  );
  
  // Freshness (20%)
  const freshness = m.daysSinceAdded < 3 ? 100 : 
                    m.daysSinceAdded < 7 ? 80 :
                    m.daysSinceAdded < 14 ? 60 :
                    m.daysSinceAdded < 30 ? 40 : 20;
  
  // Base score (20%) - prevents 0 scores
  const baseScore = 15;
  
  const finalScore = Math.round(
    ownScore * 0.30 +
    githubScore * 0.15 +
    hfScore * 0.15 +
    freshness * 0.20 +
    baseScore * 0.20
  );
  
  return Math.min(100, finalScore);
}

async function recalculateAllScores() {
  const tools = await prisma.tool.findMany({
    where: { isActive: true }
  });
  
  console.log(`Recalculating heat scores for ${tools.length} tools...\n`);
  
  for (const tool of tools) {
    const clicks7d = await getClickCount7d(tool.id);
    
    const daysSinceAdded = Math.floor(
      (Date.now() - tool.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const metrics: HeatMetrics = {
      clicks7d,
      saves: tool.saveCount || 0,
      githubStars: tool.githubStars || 0,
      githubGrowth7d: tool.githubStarsGrowth7d || 0,
      hfDownloads: tool.hfDownloads || 0,
      hfLikes: tool.hfLikes || 0,
      hfGrowth7d: tool.hfDownloadsGrowth7d || 0,
      daysSinceAdded,
      baseScore: 15,
    };
    
    const newScore = calculateHeatScore(metrics);
    
    // Update clickCount7d for caching
    await prisma.tool.update({
      where: { id: tool.id },
      data: { 
        trendingScore: newScore,
        clickCount7d: clicks7d,
        updatedAt: new Date()
      }
    });
    
    if (Math.abs(newScore - tool.trendingScore) > 2) {
      console.log(`${tool.name}: ${tool.trendingScore} → ${newScore} (clicks7d: ${clicks7d})`);
    }
  }
  
  console.log('\nRecalculation complete!');
}

recalculateAllScores()
  .then(() => prisma.$disconnect())
  .catch(console.error);

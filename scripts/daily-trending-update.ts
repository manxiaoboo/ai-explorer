/**
 * Daily Trending Score Update - Complete Workflow
 * Run this daily to update all trending scores
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Trending Score Calculation Algorithm
// ============================================

function calculateTrendingScore(tool: any): number {
  // 1. GitHub Popularity (0-100) - 25% weight
  const githubScore = tool.githubStars 
    ? Math.min(100, Math.log10(tool.githubStars) * 20) 
    : 0;
  
  // 2. Growth Rate (0-100) - 10% weight
  let growthScore = 0;
  if (tool.githubStarsGrowth7d && tool.githubStars) {
    growthScore = Math.min(100, (tool.githubStarsGrowth7d / tool.githubStars) * 2000);
  }
  
  // 3. Product Hunt (0-100) - 10% weight
  const phScore = tool.productHuntVotes 
    ? Math.min(100, 20 + Math.log10(tool.productHuntVotes / 50 + 1) * 25)
    : 0;
  
  // 4. Hugging Face (0-100) - 5% weight
  const hfScore = tool.hfDownloads 
    ? Math.min(100, Math.log10(tool.hfDownloads + 1) * 12 + (tool.hfLikes || 0) / 30)
    : 0;
  
  // 5. Platform Engagement (0-100) - 15% weight
  const engagementScore = Math.min(100, 
    Math.log10(tool.clickCount + 1) * 12 + tool.saveCount * 1.5
  );
  
  // 6. Quality Signals (0-100) - 20% weight
  let qualityScore = 0;
  const hasHomepage = tool.website && !tool.website.includes('github.com');
  if (hasHomepage) qualityScore += 25;
  if (tool.description?.length > 200) qualityScore += 25;
  if (tool.githubStars > 0) qualityScore += 25;
  const daysOld = (Date.now() - tool.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld > 30 && daysOld < 365) qualityScore += 25;
  
  // 7. Freshness (0-100) - 15% weight
  let freshnessScore = 0;
  if (daysOld < 7) freshnessScore = 70;
  else if (daysOld < 30) freshnessScore = 40;
  else freshnessScore = 15;
  
  // Weighted sum
  return Math.min(100, Math.round(
    githubScore * 0.25 +
    growthScore * 0.10 +
    phScore * 0.10 +
    hfScore * 0.05 +
    engagementScore * 0.15 +
    qualityScore * 0.20 +
    freshnessScore * 0.15
  ));
}

// ============================================
// Main Update Workflow
// ============================================

async function updateTrendingScores() {
  console.log('========================================');
  console.log('Daily Trending Score Update');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('========================================\n');
  
  // Get all active tools
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
  const changes: Array<{name: string, old: number, new: number}> = [];
  
  // Calculate and update scores
  for (const tool of tools) {
    const newScore = calculateTrendingScore(tool);
    
    if (Math.abs(newScore - tool.trendingScore) > 0.5) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: { trendingScore: newScore }
      });
      
      changes.push({ name: tool.name, old: tool.trendingScore, new: newScore });
      updated++;
    }
  }
  
  // Sort by biggest changes
  changes.sort((a, b) => Math.abs(b.new - b.old) - Math.abs(a.new - a.old));
  
  console.log('📊 Top Changes:');
  changes.slice(0, 10).forEach(c => {
    const arrow = c.new > c.old ? '↑' : '↓';
    console.log(`  ${arrow} ${c.name}: ${c.old} → ${c.new}`);
  });
  
  console.log(`\n✅ Updated ${updated} tools`);
  
  // Statistics
  const stats = await prisma.tool.aggregate({
    where: { isActive: true },
    _avg: { trendingScore: true },
    _max: { trendingScore: true },
    _min: { trendingScore: true }
  });
  
  console.log('\n📈 Statistics:');
  console.log(`  Average: ${stats._avg.trendingScore?.toFixed(1)}`);
  console.log(`  Highest: ${stats._max.trendingScore}`);
  console.log(`  Lowest: ${stats._min.trendingScore}`);
  
  // Top 10
  const topTools = await prisma.tool.findMany({
    where: { isActive: true },
    orderBy: { trendingScore: 'desc' },
    take: 10,
    select: { name: true, trendingScore: true, githubStars: true }
  });
  
  console.log('\n🏆 Top 10 Trending:');
  topTools.forEach((t, i) => {
    console.log(`  ${i+1}. ${t.name} (${t.trendingScore}) ⭐${t.githubStars || 0}`);
  });
  
  console.log('\n========================================');
  console.log(`Finished: ${new Date().toISOString()}`);
  console.log('========================================');
}

// Run the update
updateTrendingScores()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('❌ Error:', error);
    prisma.$disconnect();
    process.exit(1);
  });

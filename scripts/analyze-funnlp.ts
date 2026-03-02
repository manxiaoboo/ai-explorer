import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeFunNLP() {
  // Find FunNLP
  const funnlp = await prisma.tool.findFirst({
    where: {
      name: {
        contains: 'FunNLP',
        mode: 'insensitive'
      }
    }
  });
  
  if (!funnlp) {
    console.log('FunNLP not found');
    return;
  }
  
  console.log('=== FunNLP Analysis ===\n');
  console.log('Name:', funnlp.name);
  console.log('GitHub Stars:', funnlp.githubStars?.toLocaleString() || 0);
  console.log('GitHub Stars Growth 7d:', funnlp.githubStarsGrowth7d || 0);
  console.log('Product Hunt Votes:', funnlp.productHuntVotes || 0);
  console.log('HF Downloads:', funnlp.hfDownloads || 0);
  console.log('HF Likes:', funnlp.hfLikes || 0);
  console.log('Click Count:', funnlp.clickCount || 0);
  console.log('Click Count 7d:', funnlp.clickCount7d || 0);
  console.log('Save Count:', funnlp.saveCount || 0);
  console.log('Trending Score:', funnlp.trendingScore);
  console.log('Created At:', funnlp.createdAt);
  console.log('Website:', funnlp.website);
  
  // Calculate individual scores
  const githubScore = funnlp.githubStars 
    ? Math.min(100, Math.log10(funnlp.githubStars) * 20) 
    : 0;
  
  let growthScore = 0;
  if (funnlp.githubStarsGrowth7d && funnlp.githubStars) {
    growthScore = Math.min(100, (funnlp.githubStarsGrowth7d / funnlp.githubStars) * 2000);
  }
  
  const phScore = funnlp.productHuntVotes 
    ? Math.min(100, 20 + Math.log10(funnlp.productHuntVotes / 50 + 1) * 25)
    : 0;
  
  const hfScore = funnlp.hfDownloads 
    ? Math.min(100, Math.log10(funnlp.hfDownloads + 1) * 12 + (funnlp.hfLikes || 0) / 30)
    : 0;
  
  const engagementScore = Math.min(100, 
    Math.log10((funnlp.clickCount || 0) + 1) * 12 + (funnlp.saveCount || 0) * 1.5
  );
  
  let qualityScore = 0;
  const hasHomepage = funnlp.website && !funnlp.website.includes('github.com');
  if (hasHomepage) qualityScore += 25;
  if (funnlp.description?.length > 200) qualityScore += 25;
  if ((funnlp.githubStars || 0) > 0) qualityScore += 25;
  const daysOld = (Date.now() - funnlp.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld > 30 && daysOld < 365) qualityScore += 25;
  
  let freshnessScore = 0;
  if (daysOld < 7) freshnessScore = 70;
  else if (daysOld < 30) freshnessScore = 40;
  else freshnessScore = 15;
  
  console.log('\n=== Score Breakdown ===');
  console.log(`GitHub Score (25%): ${githubScore.toFixed(1)} * 0.25 = ${(githubScore * 0.25).toFixed(1)}`);
  console.log(`Growth Score (10%): ${growthScore.toFixed(1)} * 0.10 = ${(growthScore * 0.10).toFixed(1)}`);
  console.log(`Product Hunt Score (10%): ${phScore.toFixed(1)} * 0.10 = ${(phScore * 0.10).toFixed(1)}`);
  console.log(`HF Score (5%): ${hfScore.toFixed(1)} * 0.05 = ${(hfScore * 0.05).toFixed(1)}`);
  console.log(`Engagement Score (15%): ${engagementScore.toFixed(1)} * 0.15 = ${(engagementScore * 0.15).toFixed(1)}`);
  console.log(`Quality Score (20%): ${qualityScore.toFixed(1)} * 0.20 = ${(qualityScore * 0.20).toFixed(1)}`);
  console.log(`Freshness Score (15%): ${freshnessScore.toFixed(1)} * 0.15 = ${(freshnessScore * 0.15).toFixed(1)}`);
  
  const totalScore = Math.min(100, Math.round(
    githubScore * 0.25 +
    growthScore * 0.10 +
    phScore * 0.10 +
    hfScore * 0.05 +
    engagementScore * 0.15 +
    qualityScore * 0.20 +
    freshnessScore * 0.15
  ));
  
  console.log(`\nCalculated Total: ${totalScore}`);
  console.log(`Stored Score: ${funnlp.trendingScore}`);
  
  await prisma.$disconnect();
}

analyzeFunNLP().catch(console.error);

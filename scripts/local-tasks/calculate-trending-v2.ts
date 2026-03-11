/**
 * Trending Score Calculator V2 - 真实热度算法 (优化版)
 * 
 * 核心改进：
 * 1. 新鲜度加成随时间衰减，避免所有新工具同分
 * 2. 无用户数据时，依靠平台数据区分
 * 3. 引入"热度加速度"概念：增长快的工具排名更高
 */

import { prisma } from "./lib/db";

const CONFIG = {
  // 基准值
  benchmarks: {
    clicks24h: 20,      // 24小时20次点击为满分
    clicks7d: 100,      // 7天100次为满分
    saves: 10,          // 10个收藏为满分
    githubStars: 500,   // 500 stars (降低门槛)
    hfDownloads: 1000,  // 1000 downloads
    phVotes: 50,        // 50 PH votes
  },
  
  // 维度权重 (调整以突出平台数据)
  weights: {
    traffic: 0.30,      // 流量 30%
    engagement: 0.20,   // 互动 20%
    growth: 0.15,       // 增长率 15%
    platform: 0.25,     // 平台数据 25% (提高)
    freshness: 0.10,    // 新鲜度 10%
  },
};

/**
 * 计算流量分数 (带时间衰减)
 */
function calculateTrafficScore(tool: any): number {
  const { benchmarks } = CONFIG;
  
  // 估算各时段点击
  const clicks7d = tool.clickCount7d || 0;
  const clicks24h = Math.floor(clicks7d * 0.25); // 24h约占1/4
  const clicksTotal = tool.clickCount || clicks7d;
  
  if (clicks7d === 0) return 0;
  
  // 计算热度趋势 (近24h vs 之前)
  const previousClicks = clicks7d - clicks24h;
  const momentum = previousClicks > 0 ? clicks24h / previousClicks : 1;
  
  // 基础点击分数 (对数归一化)
  const baseScore = Math.min(
    (Math.log10(clicks7d + 1) / Math.log10(benchmarks.clicks7d + 1)) * 100,
    100
  );
  
  // 趋势加成 (正在增长的工具加分)
  const momentumBonus = Math.min(momentum * 15, 15);
  
  return Math.min(baseScore + momentumBonus, 100);
}

/**
 * 计算互动分数
 */
function calculateEngagementScore(tool: any): number {
  const { benchmarks } = CONFIG;
  
  const saves = tool.saveCount || 0;
  const clicks = tool.clickCount7d || 1; // 避免除以0
  
  // 基础收藏分
  let score = Math.min(
    (Math.log10(saves + 1) / Math.log10(benchmarks.saves + 1)) * 100,
    100
  );
  
  // 收藏率加成 (高质量指标)
  const saveRate = saves / clicks;
  if (saveRate > 0.2) score += 20;      // 20%+ 收藏率
  else if (saveRate > 0.1) score += 10; // 10%+ 收藏率
  else if (saveRate > 0.05) score += 5; // 5%+ 收藏率
  
  return Math.min(score, 100);
}

/**
 * 计算增长率分数 (热度加速度)
 */
function calculateGrowthScore(tool: any): number {
  let growthIndicators = 0;
  let totalWeight = 0;
  
  // GitHub 增长
  if (tool.githubStarsGrowth7d && tool.githubStarsGrowth7d > 0) {
    const growthRate = tool.githubStars 
      ? tool.githubStarsGrowth7d / tool.githubStars 
      : 0;
    if (growthRate > 0.1) growthIndicators += 40;      // 周增长10%+
    else if (growthRate > 0.05) growthIndicators += 25; // 5%+
    else if (growthRate > 0.02) growthIndicators += 10; // 2%+
    totalWeight += 1;
  }
  
  // HF 增长
  if (tool.hfDownloadsGrowth7d && tool.hfDownloadsGrowth7d > 0) {
    const growthRate = tool.hfDownloads
      ? tool.hfDownloadsGrowth7d / tool.hfDownloads
      : 0;
    if (growthRate > 0.1) growthIndicators += 40;
    else if (growthRate > 0.05) growthIndicators += 25;
    else if (growthRate > 0.02) growthIndicators += 10;
    totalWeight += 1;
  }
  
  // 点击增长 (估算)
  if (tool.clickCount7d && tool.clickCount7d > 10) {
    growthIndicators += Math.min(tool.clickCount7d / 2, 40);
    totalWeight += 1;
  }
  
  return totalWeight > 0 ? growthIndicators / totalWeight : 0;
}

/**
 * 计算平台分数 (优化版 - 超高分工具获得额外加成)
 */
function calculatePlatformScore(tool: any): number {
  let score = 0;
  
  // GitHub Stars (核心指标)
  if (tool.githubStars && tool.githubStars > 10) {
    const stars = tool.githubStars;
    // 分段计算，10万+ 继续加分
    if (stars >= 500000) {
      score = 150 + (stars - 500000) / 500000 * 50; // 50万+: 150-200
    } else if (stars >= 200000) {
      score = 120 + (stars - 200000) / 300000 * 30; // 20万-50万: 120-150
    } else if (stars >= 100000) {
      score = 100 + (stars - 100000) / 100000 * 20; // 10万-20万: 100-120
    } else if (stars >= 50000) {
      score = 85 + (stars - 50000) / 50000 * 15; // 5万-10万: 85-100
    } else if (stars >= 20000) {
      score = 70 + (stars - 20000) / 30000 * 15; // 2万-5万: 70-85
    } else if (stars >= 10000) {
      score = 55 + (stars - 10000) / 10000 * 15; // 1万-2万: 55-70
    } else if (stars >= 1000) {
      score = 35 + (stars - 1000) / 9000 * 20; // 1000-1万: 35-55
    } else {
      score = (stars / 1000) * 35;
    }
    
    // 加分项：有 GitHub 仓库链接
    if (tool.githubRepo) {
      score += 3;
    }
  }
  
  // HuggingFace (权重稍低)
  if (tool.hfDownloads && tool.hfDownloads > 0 && score < 50) {
    const hfScore = Math.min(
      (Math.log10(tool.hfDownloads + 1) / Math.log10(100000 + 1)) * 50,
      50
    );
    score = Math.max(score, hfScore);
  }
  
  // Product Hunt
  if (tool.productHuntVotes && tool.productHuntVotes > 0 && score < 40) {
    const phScore = Math.min(
      (tool.productHuntVotes / 100) * 40,
      40
    );
    score = Math.max(score, phScore);
  }
  
  return Math.min(score, 200); // 最高200分封顶
}

/**
 * 计算新鲜度分数 (按小时递减，避免扎堆)
 */
function calculateFreshnessScore(tool: any): number {
  const now = Date.now();
  const createdAt = new Date(tool.createdAt).getTime();
  const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
  
  // 按小时递减的新鲜度
  if (hoursSinceCreation <= 24) {
    return 40 - (hoursSinceCreation / 24) * 10; // 40->30
  }
  if (hoursSinceCreation <= 72) { // 3天
    return 30 - ((hoursSinceCreation - 24) / 48) * 10; // 30->20
  }
  if (hoursSinceCreation <= 168) { // 7天
    return 20 - ((hoursSinceCreation - 72) / 96) * 10; // 20->10
  }
  if (hoursSinceCreation <= 720) { // 30天
    return 10 - ((hoursSinceCreation - 168) / 552) * 10; // 10->0
  }
  
  return 0;
}

/**
 * 主计算函数
 */
function calculateFinalScore(tool: any): number {
  const { weights } = CONFIG;
  
  const traffic = calculateTrafficScore(tool);
  const engagement = calculateEngagementScore(tool);
  const growth = calculateGrowthScore(tool);
  const platform = calculatePlatformScore(tool);
  const freshness = calculateFreshnessScore(tool);
  
  // 加权总分
  const score = 
    traffic * weights.traffic +
    engagement * weights.engagement +
    growth * weights.growth +
    platform * weights.platform +
    freshness * weights.freshness;
  
  return Math.round(score * 10) / 10;
}

/**
 * 获取年龄标签
 */
function getAgeLabel(createdAt: Date): string {
  const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
  
  if (hours < 1) return "⚡ 刚刚";
  if (hours < 24) return `⚡ ${hours}小时前`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return "🆕 昨天";
  if (days <= 3) return `🆕 ${days}天前`;
  if (days <= 7) return `🔥 ${days}天前`;
  if (days <= 30) return `📅 ${days}天前`;
  
  return "";
}

/**
 * 主函数
 */
async function main() {
  console.log("🔥 真实热度算法 V2.1 - 优化版\n");
  console.log("=".repeat(70));
  console.log("算法特点：");
  console.log("  • 流量数据主导 (35%) - 真实用户行为");
  console.log("  • 互动质量加权 (25%) - 收藏转化率");
  console.log("  • 增长率奖励 (20%) - 热度加速度");
  console.log("  • 平台数据辅助 (15%) - GitHub/HF/PH");
  console.log("  • 新鲜度递减 (5%) - 按小时衰减");
  console.log("=".repeat(70) + "\n");
  
  const tools = await prisma.tool.findMany({ where: { isActive: true } });
  console.log(`📦 处理 ${tools.length} 个工具...\n`);
  
  const results: any[] = [];
  
  for (const tool of tools) {
    const score = calculateFinalScore(tool);
    
    await prisma.tool.update({
      where: { id: tool.id },
      data: { trendingScore: score },
    });
    
    results.push({
      name: tool.name,
      score,
      age: getAgeLabel(tool.createdAt),
      clicks: tool.clickCount7d || 0,
      saves: tool.saveCount || 0,
      github: tool.githubStars || 0,
    });
  }
  
  // 排序
  results.sort((a, b) => b.score - a.score);
  
  console.log("🔥🔥🔥 热度排行榜 Top 20 🔥🔥🔥\n");
  console.log("排名 | 工具名称         | 热度分 | 新鲜度      | 点击 | 收藏 | GitHub");
  console.log("-".repeat(80));
  
  results.slice(0, 20).forEach((t, i) => {
    console.log(
      `${(i + 1).toString().padStart(2)} | ` +
      `${t.name.slice(0, 16).padEnd(16)} | ` +
      `${t.score.toFixed(1).padStart(6)} | ` +
      `${t.age.padEnd(11)} | ` +
      `${t.clicks.toString().padStart(4)} | ` +
      `${t.saves.toString().padStart(4)} | ` +
      `${t.github.toString().padStart(6)}`
    );
  });
  
  // 统计
  const distribution = {
    hot: results.filter(r => r.score >= 50).length,
    warm: results.filter(r => r.score >= 25 && r.score < 50).length,
    normal: results.filter(r => r.score < 25).length,
  };
  
  console.log("\n" + "=".repeat(70));
  console.log("📊 热度分布：");
  console.log(`  🔥 高热 (50+): ${distribution.hot} 个`);
  console.log(`  ⭐ 温热 (25-50): ${distribution.warm} 个`);
  console.log(`  📋 普通 (<25): ${distribution.normal} 个`);
  console.log("=".repeat(70));
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

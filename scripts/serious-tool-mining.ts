#!/usr/bin/env node
/**
 * 严肃的工具挖掘管道 (Serious Tool Mining Pipeline)
 * 
 * 核心理念：质量 > 数量
 * - 从权威来源发现
 * - 验证可用性和活跃度
 * - 多维度热门度评估
 * - 人工审核级别的分类
 * 
 * 数据来源优先级：
 * 1. GitHub Trending (今日/本周)
 * 2. Product Hunt (每日热门)
 * 3. Hacker News (AI 相关热门)
 * 4. Reddit r/MachineLearning (高赞项目)
 * 5. 权威博客/Newsletter (优先级发现)
 */

const fs = require('fs');
const path = require('path');

// 挖掘配置
const MIN_QUALITY_THRESHOLD = {
  githubStars: 500,           // 至少 500 stars
  githubUpdatedDays: 90,      // 90 天内有更新
  productHuntVotes: 100,      // PH 至少 100 votes
  hasDocumentation: true,     // 必须有文档
  hasWorkingWebsite: true     // 官网必须可访问
};

// 权威发现源
const DISCOVERY_SOURCES = {
  // GitHub Trending - 最可靠的来源
  githubTrending: {
    url: 'https://api.github.com/search/repositories',
    queries: [
      { q: 'topic:artificial-intelligence stars:>500 pushed:>2025-01-01', sort: 'stars', per_page: 30 },
      { q: 'topic:machine-learning stars:>500 pushed:>2025-01-01', sort: 'stars', per_page: 30 },
      { q: 'topic:llm stars:>300 pushed:>2025-01-01', sort: 'stars', per_page: 30 },
      { q: 'topic:ai-assistant stars:>300 pushed:>2025-01-01', sort: 'stars', per_page: 30 },
    ]
  },
  
  // Product Hunt - 产品化程度高的工具
  productHunt: {
    // 通过搜索发现，需要特定 API
    categories: ['ai', 'developer-tools', 'productivity']
  }
};

// 质量评分算法
function calculateQualityScore(tool) {
  let score = 0;
  const maxScore = 100;
  
  // GitHub 健康度 (40 分)
  if (tool.githubStars) {
    score += Math.min(20, Math.log10(tool.githubStars) * 4);  // Stars 分数
  }
  if (tool.githubForks) {
    score += Math.min(10, Math.log10(tool.githubForks + 1) * 3);  // Forks 分数
  }
  if (tool.githubUpdatedAt) {
    const daysSinceUpdate = (Date.now() - new Date(tool.githubUpdatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) score += 10;
    else if (daysSinceUpdate < 90) score += 5;
  }
  
  // 产品完整度 (30 分)
  if (tool.hasWebsite) score += 10;
  if (tool.hasDocumentation) score += 10;
  if (tool.hasExamples) score += 5;
  if (tool.hasCommunity) score += 5;
  
  // 流行度 (20 分)
  if (tool.productHuntVotes) {
    score += Math.min(10, tool.productHuntVotes / 50);
  }
  if (tool.twitterMentions) {
    score += Math.min(10, Math.log10(tool.twitterMentions) * 2);
  }
  
  // 技术质量 (10 分)
  if (tool.hasTests) score += 3;
  if (tool.hasCI) score += 3;
  if (tool.hasLicense) score += 4;
  
  return Math.min(maxScore, Math.round(score));
}

// 智能分类 - 基于实际功能而非关键词
function categorizeByFunction(tool) {
  const { name, description, topics = [] } = tool;
  const text = `${name} ${description} ${topics.join(' ')}`.toLowerCase();
  
  // 通过 topics 和功能描述判断，而非简单关键词
  const categoryRules = [
    {
      category: 'chat',
      signals: ['chatbot', 'chat', 'conversational', 'llm', 'gpt', 'claude'],
      excludeIf: ['image generation', 'video generation']
    },
    {
      category: 'image',
      signals: ['image generation', 'diffusion', 'stable-diffusion', 'dalle', 'midjourney'],
      excludeIf: ['text generation']
    },
    {
      category: 'code',
      signals: ['code assistant', 'copilot', 'ide', 'code completion', 'developer'],
      excludeIf: ['chatbot', 'writing']
    },
    {
      category: 'writing',
      signals: ['writing assistant', 'content', 'copywriting', 'blog'],
      excludeIf: ['code', 'programming']
    },
    {
      category: 'video',
      signals: ['video generation', 'text-to-video', 'video editing'],
      excludeIf: ['image only']
    },
    {
      category: 'audio',
      signals: ['voice', 'speech', 'tts', 'audio generation', 'music'],
      excludeIf: ['text generation']
    },
    {
      category: 'data',
      signals: ['data analysis', 'visualization', 'analytics', 'ml platform'],
      excludeIf: ['general ai']
    },
    {
      category: 'automation',
      signals: ['workflow', 'automation', 'agent', 'rpa'],
      excludeIf: ['simple tool']
    }
  ];
  
  for (const rule of categoryRules) {
    const hasSignal = rule.signals.some(s => text.includes(s));
    const hasExclude = rule.excludeIf.some(e => text.includes(e));
    
    if (hasSignal && !hasExclude) {
      return rule.category;
    }
  }
  
  return 'other';
}

// 验证工具可用性
async function validateToolAvailability(tool) {
  const results = {
    websiteAccessible: false,
    hasDocumentation: false,
    lastUpdatedRecently: false,
    hasActiveCommunity: false
  };
  
  // 检查官网可访问性 (HEAD 请求)
  if (tool.website) {
    try {
      const response = await fetch(tool.website, { 
        method: 'HEAD',
        timeout: 5000 
      });
      results.websiteAccessible = response.ok;
    } catch {
      results.websiteAccessible = false;
    }
  }
  
  // 检查 GitHub 更新频率
  if (tool.githubUpdatedAt) {
    const daysSinceUpdate = (Date.now() - new Date(tool.githubUpdatedAt).getTime()) / (1000 * 60 * 60 * 24);
    results.lastUpdatedRecently = daysSinceUpdate < MIN_QUALITY_THRESHOLD.githubUpdatedDays;
  }
  
  // 检查是否有文档 (README 长度)
  if (tool.readmeLength && tool.readmeLength > 1000) {
    results.hasDocumentation = true;
  }
  
  return results;
}

// 从 GitHub Trending 挖掘
async function mineFromGitHub() {
  console.log('🔍 Mining from GitHub Trending...\n');
  
  const discovered = [];
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'atooli-serious-miner',
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
  };
  
  for (const query of DISCOVERY_SOURCES.githubTrending.queries) {
    console.log(`  Query: ${query.q}`);
    
    try {
      const response = await fetch(
        `${DISCOVERY_SOURCES.githubTrending.url}?q=${encodeURIComponent(query.q)}&sort=${query.sort}&per_page=${query.per_page}`,
        { headers }
      );
      
      if (!response.ok) {
        console.log(`  ⚠️  API error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const repos = data.items || [];
      
      for (const repo of repos) {
        // 基础质量筛选
        if (repo.stargazers_count < MIN_QUALITY_THRESHOLD.githubStars) continue;
        
        const tool = {
          name: repo.name,
          slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 60),
          description: repo.description || '',
          website: repo.homepage || repo.html_url,
          githubRepo: repo.html_url,
          githubStars: repo.stargazers_count,
          githubForks: repo.forks_count,
          githubUpdatedAt: repo.pushed_at,
          language: repo.language,
          topics: repo.topics || [],
          hasLicense: !!repo.license,
          source: 'github-trending'
        };
        
        // 质量评分
        tool.qualityScore = calculateQualityScore(tool);
        
        // 智能分类
        tool.category = categorizeByFunction(tool);
        
        // 只保留高质量工具
        if (tool.qualityScore >= 60) {
          discovered.push(tool);
          console.log(`    ✅ ${tool.name} (Score: ${tool.qualityScore}, ${tool.category})`);
        } else {
          console.log(`    ⏭️  ${tool.name} (Score: ${tool.qualityScore} - too low)`);
        }
      }
      
      // 避免限流
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  return discovered;
}

// 去重和排序
function deduplicateAndRank(tools) {
  const seen = new Map();
  
  for (const tool of tools) {
    if (!seen.has(tool.slug) || seen.get(tool.slug).qualityScore < tool.qualityScore) {
      seen.set(tool.slug, tool);
    }
  }
  
  return Array.from(seen.values())
    .sort((a, b) => b.qualityScore - a.qualityScore);
}

// 主流程
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('   🔥 SERIOUS TOOL MINING PIPELINE 🔥');
  console.log('   Quality over Quantity');
  console.log('═══════════════════════════════════════════════\n');
  
  const startTime = Date.now();
  let allTools = [];
  
  // 1. 从 GitHub Trending 挖掘
  const githubTools = await mineFromGitHub();
  allTools.push(...githubTools);
  
  // 2. 去重和排序
  const uniqueTools = deduplicateAndRank(allTools);
  
  // 3. 保存结果
  const outputPath = path.join(__dirname, '..', 'data', 'serious-mined-tools.json');
  fs.writeFileSync(outputPath, JSON.stringify(uniqueTools, null, 2));
  
  // 4. 统计报告
  const duration = (Date.now() - startTime) / 1000;
  const categoryStats = {};
  for (const tool of uniqueTools) {
    categoryStats[tool.category] = (categoryStats[tool.category] || 0) + 1;
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('   📊 MINING REPORT');
  console.log('═══════════════════════════════════════════════');
  console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
  console.log(`🔧 Tools Mined: ${uniqueTools.length}`);
  console.log(`💎 Avg Quality Score: ${(uniqueTools.reduce((a, t) => a + t.qualityScore, 0) / uniqueTools.length || 0).toFixed(1)}`);
  console.log('\n📂 Categories:');
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`   ${cat}: ${count}`));
  console.log(`\n💾 Saved to: ${outputPath}`);
  console.log('═══════════════════════════════════════════════');
  
  // 显示 Top 10
  console.log('\n🏆 Top 10 High-Quality Tools:');
  uniqueTools.slice(0, 10).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.name} (${t.qualityScore} pts, ⭐${t.githubStars}, ${t.category})`);
  });
}

main().catch(console.error);

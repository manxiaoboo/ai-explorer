/**
 * 修复缺失的统计数据
 * 
 * 从 features/description 中提取平台数据
 */

import { prisma } from "./lib/db";

async function fixMissingStats() {
  console.log("🔧 修复缺失的统计数据\n");
  
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
  });
  
  let fixed = 0;
  
  for (const tool of tools) {
    let updates: any = {};
    
    // 1. 从 features 中提取 GitHub stars
    if (!tool.githubStars && tool.features) {
      for (const feature of tool.features) {
        const match = feature.match(/(\d+,?\d*)\s*stars?/i);
        if (match) {
          const stars = parseInt(match[1].replace(/,/g, ""));
          if (stars > 0) {
            updates.githubStars = stars;
            console.log(`⭐ ${tool.name}: ${stars} stars from features`);
            break;
          }
        }
      }
    }
    
    // 2. 从 description 提取 GitHub repo
    if (!tool.githubRepo && tool.description) {
      const ghMatch = tool.description.match(/github\.com\/([^\/\s]+\/[^\/\s\)]+)/);
      if (ghMatch) {
        updates.githubRepo = `https://github.com/${ghMatch[1]}`;
        console.log(`🔗 ${tool.name}: GitHub repo found`);
      }
    }
    
    // 3. 从 website 推断平台
    if (!tool.hfModelId && tool.website?.includes("huggingface.co")) {
      const hfMatch = tool.website.match(/huggingface\.co\/([^\/\s]+)/);
      if (hfMatch) {
        updates.hfModelId = hfMatch[1];
        console.log(`🤗 ${tool.name}: HF model found`);
      }
    }
    
    // 应用更新
    if (Object.keys(updates).length > 0) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: updates,
      });
      fixed++;
    }
  }
  
  console.log(`\n✅ 修复了 ${fixed} 个工具`);
}

fixMissingStats()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

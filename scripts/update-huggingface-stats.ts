/**
 * HuggingFace Stats Updater
 * 
 * Fetches downloads and likes for tools with HuggingFace models.
 * Should run daily via cron.
 */

import { prisma } from "./lib/prisma";

interface HFModelInfo {
  downloads: number;
  likes: number;
  trendingScore: number;
}

async function fetchHFStats(modelId: string): Promise<HFModelInfo | null> {
  try {
    const response = await fetch(
      `https://huggingface.co/api/models/${modelId}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`  Model not found: ${modelId}`);
      } else {
        console.log(`  HF API error: ${response.status}`);
      }
      return null;
    }
    
    const data = await response.json();
    
    return {
      downloads: data.downloads || 0,
      likes: data.likes || 0,
      trendingScore: data.trendingScore || 0,
    };
  } catch (error) {
    console.error(`  Failed to fetch HF stats:`, error);
    return null;
  }
}

async function updateHFStats() {
  console.log("🤗 Starting HuggingFace stats update...\n");
  
  // Get tools with HF models
  const tools = await prisma.tool.findMany({
    where: {
      isActive: true,
      hfModelId: { not: null },
    },
  });
  
  console.log(`📊 Found ${tools.length} tools with HuggingFace models\n`);
  
  let updated = 0;
  let errors = 0;
  
  for (const tool of tools) {
    if (!tool.hfModelId) continue;
    
    console.log(`🔍 ${tool.name}`);
    
    const stats = await fetchHFStats(tool.hfModelId);
    
    if (!stats) {
      errors++;
      continue;
    }
    
    // Calculate 7-day growth if we have previous data
    let growth7d = tool.hfDownloadsGrowth7d || 0;
    if (tool.hfDownloads && tool.hfDownloads > 0) {
      const diff = stats.downloads - tool.hfDownloads;
      if (diff > 0) {
        growth7d = diff;
      }
    }
    
    // Update tool
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        hfDownloads: stats.downloads,
        hfDownloadsGrowth7d: growth7d,
        hfLikes: stats.likes,
      },
    });
    
    console.log(`  ⬇️ ${stats.downloads.toLocaleString()} downloads | ❤️ ${stats.likes} likes`);
    updated++;
    
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ Updated ${updated} tools`);
  if (errors > 0) console.log(`❌ ${errors} errors`);
}

// Run if executed directly
if (require.main === module) {
  updateHFStats()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to update HF stats:", error);
      process.exit(1);
    });
}

/**
 * HuggingFace Stats Updater (Local)
 * 
 * 在本地运行，更新远程数据库中的 HF 统计
 */

import { prisma } from "./lib/db";

interface HFModelInfo {
  downloads: number;
  likes: number;
}

async function fetchHFStats(modelId: string): Promise<HFModelInfo | null> {
  try {
    const response = await fetch(
      `https://huggingface.co/api/models/${modelId}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    return {
      downloads: data.downloads || 0,
      likes: data.likes || 0,
    };
  } catch (error) {
    console.error(`    ❌ Failed to fetch:`, error);
    return null;
  }
}

async function updateHFStats() {
  console.log("🤗 HuggingFace Stats Update (Local)");
  console.log("=====================================\n");

  const tools = await prisma.tool.findMany({
    where: {
      isActive: true,
      hfModelId: { not: null },
    },
    select: {
      id: true,
      name: true,
      hfModelId: true,
      hfDownloads: true,
    },
  });

  console.log(`Found ${tools.length} tools with HF models\n`);

  let updated = 0;

  for (const tool of tools) {
    if (!tool.hfModelId) continue;

    process.stdout.write(`🔍 ${tool.name}... `);

    const stats = await fetchHFStats(tool.hfModelId);

    if (!stats) {
      console.log("❌");
      continue;
    }

    // 计算 7 天增长
    let growth7d = 0;
    if (tool.hfDownloads && tool.hfDownloads > 0) {
      const diff = stats.downloads - tool.hfDownloads;
      if (diff > 0) growth7d = diff;
    }

    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        hfDownloads: stats.downloads,
        hfDownloadsGrowth7d: growth7d,
        hfLikes: stats.likes,
      },
    });

    console.log(`✅ ${stats.downloads.toLocaleString()} downloads, ${stats.likes} likes`);
    updated++;

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n📊 Summary: ${updated} updated`);
}

updateHFStats()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("\n❌ Fatal error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

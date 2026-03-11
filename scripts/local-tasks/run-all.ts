/**
 * Local Task Runner - All Tasks
 * 
 * 在本地运行所有更新任务
 * 使用方式: npx tsx scripts/local-tasks/run-all.ts
 */

import { prisma } from "./lib/db";
import { execSync } from "child_process";
import { join } from "path";

const SCRIPTS_DIR = __dirname;

interface TaskResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
}

function runTask(name: string, script: string): TaskResult {
  const start = Date.now();
  console.log(`\n▶️ ${name}`);
  console.log("─".repeat(50));

  try {
    execSync(`npx tsx ${script}`, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: { ...process.env },
    });

    return {
      name,
      success: true,
      duration: Date.now() - start,
    };
  } catch (error: any) {
    return {
      name,
      success: false,
      duration: Date.now() - start,
      error: error.message,
    };
  }
}

async function main() {
  const startTime = Date.now();

  console.log("🚀 Atooli Local Task Runner");
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log("=".repeat(50));

  // 检查环境变量
  if (!process.env.DATABASE_URL) {
    console.error("\n❌ DATABASE_URL not set!");
    console.log("Please set it in .env.local file");
    process.exit(1);
  }

  console.log("\n📡 Database:", process.env.DATABASE_URL?.slice(0, 50) + "...");

  const results: TaskResult[] = [];

  // Task 1: Update GitHub Stats
  results.push(
    runTask("GitHub Stats Update", join(SCRIPTS_DIR, "update-github.ts"))
  );

  // Task 2: Update HuggingFace Stats
  results.push(
    runTask("HuggingFace Stats Update", join(SCRIPTS_DIR, "update-huggingface.ts"))
  );

  // Task 3: Calculate Trending Scores
  results.push(
    runTask("Calculate Trending Scores", join(SCRIPTS_DIR, "calculate-trending.ts"))
  );

  // Summary
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log("\n" + "=".repeat(50));
  console.log("📊 Task Summary");
  console.log("=".repeat(50));

  results.forEach((r) => {
    const icon = r.success ? "✅" : "❌";
    const duration = (r.duration / 1000).toFixed(1);
    console.log(`${icon} ${r.name} (${duration}s)`);
    if (r.error) {
      console.log(`   Error: ${r.error}`);
    }
  });

  console.log("\n" + "─".repeat(50));
  console.log(`Total: ${successCount} success, ${failCount} failed`);
  console.log(`Duration: ${totalDuration}s`);
  console.log("=".repeat(50));

  // 断开数据库连接
  await prisma.$disconnect();

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error("\n💥 Fatal error:", error);
  await prisma.$disconnect();
  process.exit(1);
});

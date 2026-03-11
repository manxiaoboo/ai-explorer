/**
 * Local DB Client for Remote Database
 * 
 * 使用 Prisma Client 连接远程数据库
 * 确保 DATABASE_URL 指向远程 Accelerate 地址
 */

import { PrismaClient } from "@prisma/client";

// 使用 Accelerate URL 连接远程数据库
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export { prisma };

// 优雅关闭
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

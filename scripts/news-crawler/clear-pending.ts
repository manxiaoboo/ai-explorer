import { prisma } from "./lib/db.js";

async function clear() {
  const deleted = await prisma.news.deleteMany({ where: { status: "PENDING" } });
  console.log("Deleted:", deleted.count, "pending news");
  await prisma.$disconnect();
}

clear();

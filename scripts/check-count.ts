import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.tool.count({ where: { isActive: true } });
  const categories = await prisma.category.count();
  console.log(`Total active tools: ${count}`);
  console.log(`Total categories: ${categories}`);
  await prisma.$disconnect();
}

main();

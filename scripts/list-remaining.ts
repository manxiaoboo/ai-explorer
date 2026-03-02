import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listRemaining() {
  const tools = await prisma.tool.findMany({
    where: {
      isActive: true,
      OR: [{ pricingTier: 'PAID' }, { pricingTier: 'FREEMIUM' }],
      pricingPlans: { none: {} }
    },
    orderBy: { name: 'asc' }
  });

  console.log('=== 剩余无定价工具 ===\n');
  for (const t of tools) {
    console.log(`- ${t.name}: ${t.pricingTier} (${t.website})`);
  }
  console.log(`\n总计: ${tools.length}`);
  
  await prisma.$disconnect();
}

listRemaining();

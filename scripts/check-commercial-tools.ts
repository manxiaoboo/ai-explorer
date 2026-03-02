import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCommercialTools() {
  // 获取所有商业工具（非开源）
  const tools = await prisma.tool.findMany({
    where: {
      isActive: true,
      OR: [
        { pricingTier: 'PAID' },
        { pricingTier: 'FREEMIUM' },
      ]
    },
    include: {
      pricingPlans: true
    },
    orderBy: { name: 'asc' }
  });
  
  console.log('=== Commercial Tools Pricing Status ===\n');
  console.log(`Total: ${tools.length} tools\n`);
  
  let withPlans = 0;
  let withoutPlans = 0;
  
  for (const tool of tools) {
    const hasPlans = tool.pricingPlans.length > 0;
    if (hasPlans) {
      withPlans++;
    } else {
      withoutPlans++;
      console.log(`❌ ${tool.name} (${tool.pricingTier}) - No pricing plans`);
      console.log(`   Website: ${tool.website}`);
    }
  }
  
  console.log(`\n✅ With plans: ${withPlans}`);
  console.log(`❌ Without plans: ${withoutPlans}`);
  
  await prisma.$disconnect();
}

checkCommercialTools().catch(console.error);

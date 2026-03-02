import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkClaudePricing() {
  const claude = await prisma.tool.findFirst({
    where: { name: { contains: 'Claude', mode: 'insensitive' } },
    include: { pricingPlans: true }
  });
  
  if (!claude) {
    console.log('Claude not found');
    return;
  }
  
  console.log('=== Claude Pricing ===\n');
  console.log('Tool:', claude.name);
  console.log('Pricing Tier:', claude.pricingTier);
  console.log('Has Free Tier:', claude.hasFreeTier);
  console.log('Has Trial:', claude.hasTrial);
  console.log('Price Start:', claude.priceStart);
  console.log('Price End:', claude.priceEnd);
  console.log('\nPricing Plans:');
  console.log('-'.repeat(50));
  
  if (claude.pricingPlans.length === 0) {
    console.log('No pricing plans found!');
  } else {
    for (const plan of claude.pricingPlans) {
      console.log(`\nPlan: ${plan.name}`);
      console.log(`  Price: $${plan.price}/${plan.priceUnit}`);
      console.log(`  Popular: ${plan.isPopular}`);
      console.log(`  Features: ${plan.features.join(', ')}`);
    }
  }
  
  await prisma.$disconnect();
}

checkClaudePricing().catch(console.error);

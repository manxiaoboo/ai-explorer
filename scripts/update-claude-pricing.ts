import { PrismaClient, PricingTier } from '@prisma/client';

const prisma = new PrismaClient();

interface PricingPlan {
  name: string;
  price: number | null;
  priceUnit: 'month' | 'year' | 'one-time' | 'custom';
  features: string[];
  isPopular?: boolean;
}

interface PricingData {
  tier: PricingTier;
  hasFreeTier: boolean;
  hasTrial: boolean;
  plans: PricingPlan[];
  currency: string;
  lastUpdated: Date;
}

// Claude pricing data
const claudePricing: PricingData = {
  tier: PricingTier.FREEMIUM,
  hasFreeTier: true,
  hasTrial: false,
  currency: 'USD',
  lastUpdated: new Date(),
  plans: [
    { name: 'Free', price: 0, priceUnit: 'month', features: ['Claude 3.5 Sonnet', 'Limited usage'] },
    { name: 'Pro', price: 20, priceUnit: 'month', features: ['All models', '5x more usage', 'Priority access'], isPopular: true },
    { name: 'Team', price: 25, priceUnit: 'month', features: ['All Pro features', 'Team workspace'] },
  ]
};

async function updateClaudePricing() {
  const claude = await prisma.tool.findFirst({
    where: { name: { contains: 'Claude', mode: 'insensitive' } },
    include: { pricingPlans: true }
  });
  
  if (!claude) {
    console.log('Claude not found');
    return;
  }
  
  console.log('Updating Claude pricing...');
  console.log('Tool ID:', claude.id);
  console.log('Current pricing plans:', claude.pricingPlans.length);
  
  // Update tool basic info
  await prisma.tool.update({
    where: { id: claude.id },
    data: {
      pricingTier: claudePricing.tier,
      hasFreeTier: claudePricing.hasFreeTier,
      hasTrial: claudePricing.hasTrial,
      priceStart: claudePricing.plans.find(p => p.price && p.price > 0)?.price || null,
      priceEnd: claudePricing.plans[claudePricing.plans.length - 1]?.price || null,
    }
  });
  
  // Delete old pricing plans
  const deleted = await prisma.pricingPlan.deleteMany({
    where: { toolId: claude.id }
  });
  console.log('Deleted old plans:', deleted.count);
  
  // Create new pricing plans
  if (claudePricing.plans.length > 0) {
    const created = await prisma.pricingPlan.createMany({
      data: claudePricing.plans.map((plan, index) => ({
        toolId: claude.id,
        name: plan.name,
        price: plan.price,
        priceUnit: plan.priceUnit,
        features: plan.features,
        isPopular: plan.isPopular || false,
        sortOrder: index,
      }))
    });
    console.log('Created new plans:', created.count);
  }
  
  // Verify
  const updated = await prisma.tool.findFirst({
    where: { id: claude.id },
    include: { pricingPlans: true }
  });
  
  console.log('\nUpdated pricing plans:', updated?.pricingPlans.length);
  updated?.pricingPlans.forEach(plan => {
    console.log(`- ${plan.name}: $${plan.price}/${plan.priceUnit}`);
  });
  
  await prisma.$disconnect();
}

updateClaudePricing().catch(console.error);

import { PrismaClient, PricingTier } from '@prisma/client';

const prisma = new PrismaClient();

// Default pricing templates by tier
const defaultTemplates: Record<string, any[]> = {
  [PricingTier.FREE]: [
    { name: 'Free', price: 0, priceUnit: 'month', features: ['All features free'], isPopular: true }
  ],
  [PricingTier.FREEMIUM]: [
    { name: 'Free', price: 0, priceUnit: 'month', features: ['Basic features', 'Limited usage'] },
    { name: 'Pro', price: 10, priceUnit: 'month', features: ['All features', 'Unlimited usage'], isPopular: true },
    { name: 'Enterprise', price: null, priceUnit: 'custom', features: ['Custom solutions', 'Priority support'] },
  ],
  [PricingTier.PAID]: [
    { name: 'Starter', price: 10, priceUnit: 'month', features: ['Basic plan', 'Core features'] },
    { name: 'Professional', price: 30, priceUnit: 'month', features: ['All features', 'Priority support'], isPopular: true },
    { name: 'Enterprise', price: null, priceUnit: 'custom', features: ['Custom pricing', 'Dedicated support'] },
  ],
  [PricingTier.OPEN_SOURCE]: [],
};

async function fillDefaultPricing() {
  console.log('=== Fill Default Pricing ===\n');
  
  // Get tools without pricing plans
  const tools = await prisma.tool.findMany({
    where: {
      isActive: true,
      OR: [
        { pricingTier: 'PAID' },
        { pricingTier: 'FREEMIUM' },
      ],
      pricingPlans: { none: {} }
    },
    include: { pricingPlans: true }
  });
  
  console.log(`Found ${tools.length} tools without pricing plans\n`);
  
  let updated = 0;
  
  for (const tool of tools) {
    const templates = defaultTemplates[tool.pricingTier];
    if (!templates || templates.length === 0) continue;
    
    // Adjust prices based on existing priceStart if available
    const plans = templates.map((t, idx) => ({
      ...t,
      price: t.price && tool.priceStart && idx > 0 
        ? Math.round(tool.priceStart * (idx === 1 ? 1 : 2.5)) 
        : t.price,
    }));
    
    await prisma.pricingPlan.createMany({
      data: plans.map((plan, idx) => ({
        toolId: tool.id,
        name: plan.name,
        price: plan.price,
        priceUnit: plan.priceUnit,
        features: plan.features,
        isPopular: plan.isPopular || false,
        sortOrder: idx,
      }))
    });
    
    console.log(`✅ ${tool.name}: ${plans.length} plans (from ${tool.pricingTier} template)`);
    updated++;
  }
  
  console.log(`\n=== Complete ===`);
  console.log(`Updated: ${updated} tools`);
  
  await prisma.$disconnect();
}

fillDefaultPricing().catch(console.error);

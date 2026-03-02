import { PrismaClient, PricingTier } from '@prisma/client';

const prisma = new PrismaClient();

// Extended pricing data for 50+ popular tools
const toolsPricing = [
  // AI Video
  {
    name: 'Runway ML',
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    priceStart: 15,
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['125 credits', '3 projects'] },
      { name: 'Standard', price: 15, priceUnit: 'month', features: ['625 credits'], isPopular: true },
      { name: 'Pro', price: 35, priceUnit: 'month', features: ['2250 credits', '4K exports'] },
      { name: 'Unlimited', price: 95, priceUnit: 'month', features: ['Unlimited credits'] },
    ]
  },
  {
    name: 'Pika Labs',
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    priceStart: 8,
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['3 videos/day'] },
      { name: 'Standard', price: 8, priceUnit: 'month', features: ['10 videos/day'] },
      { name: 'Pro', price: 28, priceUnit: 'month', features: ['Unlimited videos'], isPopular: true },
      { name: 'Unlimited', price: 76, priceUnit: 'month', features: ['Unlimited everything'] },
    ]
  },
];

async function bulkUpdatePricing() {
  console.log('=== Bulk Update Pricing V2 ===\n');
  
  let updated = 0;
  let skipped = 0;
  
  for (const toolData of toolsPricing) {
    const tool = await prisma.tool.findFirst({
      where: { name: toolData.name }
    });
    
    if (!tool) {
      console.log(`⚠️ Tool not found: ${toolData.name}`);
      skipped++;
      continue;
    }
    
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        pricingTier: toolData.tier,
        hasFreeTier: toolData.hasFreeTier,
        hasTrial: toolData.hasTrial,
        priceStart: toolData.priceStart,
      }
    });
    
    await prisma.pricingPlan.deleteMany({ where: { toolId: tool.id } });
    
    if (toolData.plans.length > 0) {
      await prisma.pricingPlan.createMany({
        data: toolData.plans.map((plan, idx) => ({
          toolId: tool.id,
          name: plan.name,
          price: plan.price,
          priceUnit: plan.priceUnit,
          features: plan.features,
          isPopular: plan.isPopular || false,
          sortOrder: idx,
        }))
      });
    }
    
    console.log(`✅ Updated: ${toolData.name} (${toolData.plans.length} plans)`);
    updated++;
  }
  
  console.log(`\n=== Complete ===`);
  console.log(`Updated: ${updated}, Skipped: ${skipped}`);
  
  await prisma.$disconnect();
}

bulkUpdatePricing().catch(console.error);

import { PrismaClient, PricingTier } from '@prisma/client';

const prisma = new PrismaClient();

// Top 50 commercial tools pricing data
const toolsPricing = [
  {
    name: 'ChatGPT',
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    priceStart: 20,
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['GPT-3.5', 'Limited usage'] },
      { name: 'Plus', price: 20, priceUnit: 'month', features: ['GPT-4', 'GPT-4o', 'DALL-E'], isPopular: true },
      { name: 'Team', price: 25, priceUnit: 'month', features: ['Team workspace', 'Admin controls'] },
    ]
  },
  {
    name: 'Claude',
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    priceStart: 20,
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Claude 3.5 Sonnet', 'Limited usage'] },
      { name: 'Pro', price: 20, priceUnit: 'month', features: ['All models', '5x more usage'], isPopular: true },
      { name: 'Team', price: 25, priceUnit: 'month', features: ['Team workspace'] },
    ]
  },
  {
    name: 'Midjourney',
    tier: PricingTier.PAID,
    hasFreeTier: false,
    hasTrial: false,
    priceStart: 10,
    plans: [
      { name: 'Basic', price: 10, priceUnit: 'month', features: ['3.3 hrs GPU/month'] },
      { name: 'Standard', price: 30, priceUnit: 'month', features: ['15 hrs GPU/month'], isPopular: true },
      { name: 'Pro', price: 60, priceUnit: 'month', features: ['30 hrs GPU/month'] },
      { name: 'Mega', price: 120, priceUnit: 'month', features: ['60 hrs GPU/month'] },
    ]
  },
  {
    name: 'GitHub Copilot',
    tier: PricingTier.PAID,
    hasFreeTier: false,
    hasTrial: true,
    priceStart: 10,
    plans: [
      { name: 'Individual', price: 10, priceUnit: 'month', features: ['AI code suggestions'], isPopular: true },
      { name: 'Business', price: 19, priceUnit: 'month', features: ['Team management'] },
      { name: 'Enterprise', price: 39, priceUnit: 'month', features: ['SSO', 'Audit logs'] },
    ]
  },
  {
    name: 'Perplexity AI',
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    priceStart: 20,
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Standard search'] },
      { name: 'Pro', price: 20, priceUnit: 'month', features: ['GPT-4', 'Claude 3', 'File upload'], isPopular: true },
    ]
  },
  {
    name: 'Notion',
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    priceStart: 10,
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Unlimited pages'] },
      { name: 'Plus', price: 10, priceUnit: 'month', features: ['Unlimited uploads'] },
      { name: 'Business', price: 18, priceUnit: 'month', features: ['AI features'], isPopular: true },
    ]
  },
  {
    name: 'Grammarly',
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    priceStart: 12,
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Basic grammar'] },
      { name: 'Premium', price: 12, priceUnit: 'month', features: ['Advanced grammar'], isPopular: true },
      { name: 'Business', price: 15, priceUnit: 'month', features: ['Team features'] },
    ]
  },
  {
    name: 'Jasper',
    tier: PricingTier.PAID,
    hasFreeTier: false,
    hasTrial: true,
    priceStart: 49,
    plans: [
      { name: 'Creator', price: 49, priceUnit: 'month', features: ['1 user', 'Unlimited words'] },
      { name: 'Teams', price: 125, priceUnit: 'month', features: ['3 users', 'SEO mode'], isPopular: true },
      { name: 'Business', price: null, priceUnit: 'custom', features: ['Custom users', 'API access'] },
    ]
  },
  {
    name: 'Copy.ai',
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    priceStart: 49,
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['1 user', '2,000 words'] },
      { name: 'Pro', price: 49, priceUnit: 'month', features: ['5 users', 'Unlimited words'], isPopular: true },
      { name: 'Team', price: 249, priceUnit: 'month', features: ['20 users'] },
    ]
  },
  {
    name: 'Cursor',
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    priceStart: 20,
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['200 completions/month'] },
      { name: 'Pro', price: 20, priceUnit: 'month', features: ['Unlimited', 'GPT-4'], isPopular: true },
      { name: 'Business', price: 40, priceUnit: 'month', features: ['Team management'] },
    ]
  },
];

async function bulkUpdatePricing() {
  console.log('=== Bulk Update Pricing ===\n');
  
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
    
    // Update tool
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        pricingTier: toolData.tier,
        hasFreeTier: toolData.hasFreeTier,
        hasTrial: toolData.hasTrial,
        priceStart: toolData.priceStart,
      }
    });
    
    // Delete old plans
    await prisma.pricingPlan.deleteMany({ where: { toolId: tool.id } });
    
    // Create new plans
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

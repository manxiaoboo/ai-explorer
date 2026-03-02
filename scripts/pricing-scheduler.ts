/**
 * Pricing Update Scheduler
 * Run this script to schedule automatic pricing updates
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function schedulePricingUpdates() {
  console.log('=== Pricing Update Scheduler ===\n');
  
  // Get all tools with their current pricing status
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    include: {
      pricingPlans: true,
    },
  });
  
  const categorized = {
    high: [] as typeof tools,
    medium: [] as typeof tools,
    low: [] as typeof tools,
    missing: [] as typeof tools,
  };
  
  for (const tool of tools) {
    if (tool.pricingPlans.length === 0) {
      categorized.missing.push(tool);
    } else {
      // Categorize by how accurate we think the pricing is
      const hasAccuratePricing = tool.pricingPlans.some(p => 
        p.features.length > 0 && p.price !== null
      );
      
      if (hasAccuratePricing && tool.pricingPlans.length >= 2) {
        categorized.high.push(tool);
      } else if (hasAccuratePricing) {
        categorized.medium.push(tool);
      } else {
        categorized.low.push(tool);
      }
    }
  }
  
  console.log('Pricing Accuracy Distribution:');
  console.log(`  High (accurate): ${categorized.high.length}`);
  console.log(`  Medium (needs review): ${categorized.medium.length}`);
  console.log(`  Low (template data): ${categorized.low.length}`);
  console.log(`  Missing: ${categorized.missing.length}`);
  console.log(`  Total: ${tools.length}\n`);
  
  console.log('Recommended Actions:');
  console.log('1. Run: npx tsx scripts/pricing-scraper-framework.ts high');
  console.log('   - Updates top 10 most important tools with precise scraping');
  console.log('');
  console.log('2. Run: npx tsx scripts/pricing-scraper-framework.ts medium');
  console.log('   - Updates next 10 tools with generic scraping');
  console.log('');
  console.log('3. Weekly cron job:');
  console.log('   - Updates all high priority tools');
  console.log('   - Checks for price changes');
  
  await prisma.$disconnect();
}

schedulePricingUpdates();

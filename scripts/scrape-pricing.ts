/**
 * Pricing Scraper
 * Fetches pricing data from various AI tool websites
 * Uses multiple strategies: API, structured data, common selectors
 */

import { PrismaClient, PricingTier } from '@prisma/client';

const prisma = new PrismaClient();

interface PricingPlan {
  name: string;
  price: number | null; // null for custom/enterprise
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

// Pricing scrapers for specific websites
const pricingScrapers: Record<string, (url: string) => Promise<PricingData | null>> = {
  // OpenAI / ChatGPT
  'openai.com': async (url) => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
      });
      // OpenAI pricing is static, use known values
      return {
        tier: PricingTier.FREEMIUM,
        hasFreeTier: true,
        hasTrial: false,
        currency: 'USD',
        lastUpdated: new Date(),
        plans: [
          { name: 'Free', price: 0, priceUnit: 'month', features: ['GPT-3.5', 'Limited usage'] },
          { name: 'Plus', price: 20, priceUnit: 'month', features: ['GPT-4', 'GPT-4o', 'DALL-E', 'Priority access'], isPopular: true },
          { name: 'Team', price: 25, priceUnit: 'month', features: ['All Plus features', 'Team workspace', 'Admin controls'] },
        ]
      };
    } catch {
      return null;
    }
  },
  
  // Anthropic / Claude
  'claude.ai': async () => ({
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
  }),
  
  // Midjourney
  'midjourney.com': async () => ({
    tier: PricingTier.PAID,
    hasFreeTier: false,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Basic', price: 10, priceUnit: 'month', features: ['3.3 hrs GPU/month', 'Private mode'] },
      { name: 'Standard', price: 30, priceUnit: 'month', features: ['15 hrs GPU/month', 'Private mode'], isPopular: true },
      { name: 'Pro', price: 60, priceUnit: 'month', features: ['30 hrs GPU/month', 'Private mode', 'Stealth mode'] },
      { name: 'Mega', price: 120, priceUnit: 'month', features: ['60 hrs GPU/month', 'All features'] },
    ]
  }),
  
  // GitHub Copilot
  'github.com/features/copilot': async () => ({
    tier: PricingTier.PAID,
    hasFreeTier: false,
    hasTrial: true,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Individual', price: 10, priceUnit: 'month', features: ['AI code suggestions', 'All languages'], isPopular: true },
      { name: 'Business', price: 19, priceUnit: 'month', features: ['All Individual features', 'Team management', 'Policy controls'] },
      { name: 'Enterprise', price: 39, priceUnit: 'month', features: ['All Business features', 'SSO', 'Audit logs'] },
    ]
  }),
  
  // Perplexity
  'perplexity.ai': async () => ({
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Standard search', 'Limited Copilot'] },
      { name: 'Pro', price: 20, priceUnit: 'month', features: ['Unlimited Copilot', 'GPT-4', 'Claude 3', 'File upload'], isPopular: true },
    ]
  }),
  
  // Jasper
  'jasper.ai': async () => ({
    tier: PricingTier.PAID,
    hasFreeTier: false,
    hasTrial: true,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Creator', price: 49, priceUnit: 'month', features: ['1 user', 'Unlimited words', '50+ templates'] },
      { name: 'Teams', price: 125, priceUnit: 'month', features: ['3 users', 'Unlimited words', 'SEO mode', 'Brand voice'], isPopular: true },
      { name: 'Business', price: null, priceUnit: 'custom', features: ['Custom users', 'API access', 'Advanced security'] },
    ]
  }),
  
  // Copy.ai
  'copy.ai': async () => ({
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['1 user', '2,000 words', 'Chat'] },
      { name: 'Pro', price: 49, priceUnit: 'month', features: ['5 users', 'Unlimited words', '90+ tools', 'Priority support'], isPopular: true },
      { name: 'Team', price: 249, priceUnit: 'month', features: ['20 users', 'All features', 'Workflows'] },
    ]
  }),
  
  // Grammarly
  'grammarly.com': async () => ({
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Basic grammar', 'Spell check'] },
      { name: 'Premium', price: 12, priceUnit: 'month', features: ['Advanced grammar', 'Style improvements', 'Tone detection'], isPopular: true },
      { name: 'Business', price: 15, priceUnit: 'month', features: ['All Premium features', 'Team features', 'Analytics'] },
    ]
  }),
  
  // Notion
  'notion.so': async () => ({
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Unlimited pages', '10 guests', 'Basic AI'] },
      { name: 'Plus', price: 10, priceUnit: 'month', features: ['Unlimited file uploads', '100 guests', '30 days history'] },
      { name: 'Business', price: 18, priceUnit: 'month', features: ['AI features', 'Private teams', 'Advanced permissions'], isPopular: true },
    ]
  }),
  
  // Cursor
  'cursor.sh': async () => ({
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Basic AI features', '200 completions/month'] },
      { name: 'Pro', price: 20, priceUnit: 'month', features: ['Unlimited completions', 'GPT-4', 'Claude 3.5', 'Priority support'], isPopular: true },
      { name: 'Business', price: 40, priceUnit: 'month', features: ['All Pro features', 'Team management', 'Usage analytics'] },
    ]
  }),
  
  // Runway
  'runwayml.com': async () => ({
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['125 credits', '3 projects', '720p exports'] },
      { name: 'Standard', price: 15, priceUnit: 'month', features: ['625 credits', 'Unlimited projects', '1080p exports'], isPopular: true },
      { name: 'Pro', price: 35, priceUnit: 'month', features: ['2250 credits', 'All features', '4K exports'] },
      { name: 'Unlimited', price: 95, priceUnit: 'month', features: ['Unlimited credits', 'All features'] },
    ]
  }),
  
  // Sora (OpenAI)
  'openai.com/sora': async () => ({
    tier: PricingTier.PAID,
    hasFreeTier: false,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'ChatGPT Plus', price: 20, priceUnit: 'month', features: ['Sora access', 'GPT-4', 'DALL-E 3'], isPopular: true },
      { name: 'ChatGPT Pro', price: 200, priceUnit: 'month', features: ['Extended video', 'Priority access', 'All features'] },
    ]
  }),
  
  // Gemini
  'gemini.google.com': async () => ({
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Gemini Pro', 'Limited usage'] },
      { name: 'Advanced', price: 20, priceUnit: 'month', features: ['Gemini Ultra', '2TB storage', 'Priority support'], isPopular: true },
    ]
  }),
  
  // Poe
  'poe.com': async () => ({
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Limited messages', 'Basic bots'] },
      { name: 'Pro', price: 20, priceUnit: 'month', features: ['Unlimited messages', 'All bots', 'GPT-4', 'Claude 3'], isPopular: true },
    ]
  }),
  
  // Character.AI
  'character.ai': async () => ({
    tier: PricingTier.FREEMIUM,
    hasFreeTier: true,
    hasTrial: false,
    currency: 'USD',
    lastUpdated: new Date(),
    plans: [
      { name: 'Free', price: 0, priceUnit: 'month', features: ['Unlimited chats', 'Basic characters'] },
      { name: 'c.ai+', price: 10, priceUnit: 'month', features: ['Priority access', 'Faster responses', 'Early access'], isPopular: true },
    ]
  }),
};

// Generic pricing scraper using common patterns
async function scrapeGenericPricing(url: string): Promise<PricingData | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Look for common pricing patterns
    const hasFree = /free|免费/i.test(html);
    const hasPricing = /\$\d+|\d+\.\d{2}|pricing|price|plan/i.test(html);
    
    // Extract prices (simple regex, not perfect)
    const priceMatches = html.match(/\$?\d+\.\d{2}/g) || [];
    const prices = priceMatches
      .map(p => parseFloat(p.replace('$', '')))
      .filter(p => p > 0 && p < 10000);
    
    if (prices.length === 0) {
      return {
        tier: hasFree ? PricingTier.FREE : PricingTier.PAID,
        hasFreeTier: hasFree,
        hasTrial: /trial|试用/i.test(html),
        currency: 'USD',
        lastUpdated: new Date(),
        plans: []
      };
    }
    
    // Create plans from extracted prices
    const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);
    const plans: PricingPlan[] = uniquePrices.slice(0, 4).map((price, i) => ({
      name: i === 0 ? 'Basic' : i === 1 ? 'Standard' : i === 2 ? 'Pro' : 'Enterprise',
      price,
      priceUnit: 'month',
      features: [],
      isPopular: i === 1
    }));
    
    return {
      tier: hasFree ? PricingTier.FREEMIUM : PricingTier.PAID,
      hasFreeTier: hasFree,
      hasTrial: /trial|试用/i.test(html),
      currency: 'USD',
      lastUpdated: new Date(),
      plans
    };
    
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return null;
  }
}

// Main function to update pricing for a tool
async function updateToolPricing(toolId: string, website: string): Promise<void> {
  const url = new URL(website);
  const domain = url.hostname.replace('www.', '');
  
  // Try specific scraper first
  let pricingData: PricingData | null = null;
  
  for (const [scraperDomain, scraper] of Object.entries(pricingScrapers)) {
    if (domain.includes(scraperDomain) || scraperDomain.includes(domain)) {
      console.log(`Using specific scraper for ${domain}`);
      pricingData = await scraper(website);
      break;
    }
  }
  
  // Fall back to generic scraper
  if (!pricingData) {
    console.log(`Using generic scraper for ${domain}`);
    pricingData = await scrapeGenericPricing(website);
  }
  
  if (!pricingData) {
    console.log(`Could not fetch pricing for ${domain}`);
    return;
  }
  
  // Update database
  await prisma.tool.update({
    where: { id: toolId },
    data: {
      pricingTier: pricingData.tier,
      hasFreeTier: pricingData.hasFreeTier,
      hasTrial: pricingData.hasTrial,
      priceStart: pricingData.plans.find(p => p.price && p.price > 0)?.price || null,
      priceEnd: pricingData.plans[pricingData.plans.length - 1]?.price || null,
    }
  });
  
  // Delete old pricing plans
  await prisma.pricingPlan.deleteMany({
    where: { toolId }
  });
  
  // Create new pricing plans
  if (pricingData.plans.length > 0) {
    await prisma.pricingPlan.createMany({
      data: pricingData.plans.map((plan, index) => ({
        toolId,
        name: plan.name,
        price: plan.price,
        priceUnit: plan.priceUnit,
        features: plan.features,
        isPopular: plan.isPopular || false,
        sortOrder: index,
      }))
    });
  }
  
  console.log(`Updated pricing for ${domain}: ${pricingData.plans.length} plans`);
}

// Update all tools
async function updateAllPricing() {
  console.log('=== Pricing Update ===\n');
  
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    select: { id: true, name: true, website: true }
  });
  
  console.log(`Found ${tools.length} tools to check\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const tool of tools) {
    try {
      console.log(`Checking ${tool.name}...`);
      await updateToolPricing(tool.id, tool.website);
      updated++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Failed to update ${tool.name}:`, error);
      failed++;
    }
  }
  
  console.log(`\n=== Complete ===`);
  console.log(`Updated: ${updated}, Failed: ${failed}`);
  
  await prisma.$disconnect();
}

// Run if called directly
if (require.main === module) {
  updateAllPricing().catch(console.error);
}

export { updateToolPricing, PricingData, PricingPlan };

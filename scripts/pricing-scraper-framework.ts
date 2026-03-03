/**
 * Smart Pricing Scraper Framework
 * Supports custom selectors per tool with fallback strategies
 */

import { PrismaClient, PricingTier } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

// Tool-specific scraping configurations
const toolConfigs: Record<string, {
  priority: 'high' | 'medium' | 'low';
  pricingUrl?: string;
  selectors: {
    plans: string;
    name?: string;
    price?: string;
    features?: string;
  };
  parsePrice: (text: string) => number | null;
  postProcess?: (plans: any[]) => any[];
}> = {
  // High Priority - Custom precise scraping
  'ChatGPT': {
    priority: 'high',
    pricingUrl: 'https://openai.com/chatgpt/pricing',
    selectors: {
      plans: '[data-testid="pricing-card"], .pricing-card, .plan-card',
      name: 'h3, .plan-name, [data-testid="plan-name"]',
      price: '.price, [data-testid="price"], .amount',
      features: 'ul li, .feature-list li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Claude': {
    priority: 'high',
    pricingUrl: 'https://www.anthropic.com/pricing',
    selectors: {
      plans: '.pricing-tier, .plan-card, [class*="pricing"]',
      name: 'h3, .tier-name',
      price: '.price, .amount, [class*="price"]',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Midjourney': {
    priority: 'high',
    pricingUrl: 'https://www.midjourney.com/pricing',
    selectors: {
      plans: '.plan, .pricing-tier',
      name: 'h3, .plan-title',
      price: '.price, .cost',
      features: '.features li, ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'GitHub Copilot': {
    priority: 'high',
    pricingUrl: 'https://github.com/features/copilot#pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price, [data-testid="price"]',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Elicit': {
    priority: 'high',
    pricingUrl: 'https://elicit.org/pricing',
    selectors: {
      plans: '.pricing-tier, .plan-card, [class*="tier"]',
      name: 'h3, .tier-name, .plan-name',
      price: '.price, .amount, [class*="price"]',
      features: 'ul li, .feature',
    },
    parsePrice: (text) => {
      // Elicit format: "$49/month" or "$169/month"
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Perplexity AI': {
    priority: 'high',
    pricingUrl: 'https://www.perplexity.ai/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Notion': {
    priority: 'high',
    pricingUrl: 'https://www.notion.so/pricing',
    selectors: {
      plans: '.pricing-plan, .plan-card',
      name: 'h3, .plan-name',
      price: '.price, .amount',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Grammarly': {
    priority: 'high',
    pricingUrl: 'https://www.grammarly.com/plans',
    selectors: {
      plans: '.plan-card, .pricing-tier',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Jasper': {
    priority: 'high',
    pricingUrl: 'https://www.jasper.ai/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3, .plan-title',
      price: '.price, .amount',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Copy.ai': {
    priority: 'high',
    pricingUrl: 'https://www.copy.ai/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  // Medium Priority - Generic scraping with custom post-processing
  'Cursor': {
    priority: 'medium',
    pricingUrl: 'https://cursor.com/pricing',
    selectors: {
      plans: '.plan, .pricing-tier',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Runway ML': {
    priority: 'medium',
    pricingUrl: 'https://runwayml.com/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'ElevenLabs': {
    priority: 'medium',
    pricingUrl: 'https://elevenlabs.io/pricing',
    selectors: {
      plans: '.pricing-tier, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Leonardo.ai': {
    priority: 'medium',
    pricingUrl: 'https://leonardo.ai/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'HeyGen': {
    priority: 'medium',
    pricingUrl: 'https://www.heygen.com/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Synthesia': {
    priority: 'medium',
    pricingUrl: 'https://www.synthesia.io/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Descript': {
    priority: 'medium',
    pricingUrl: 'https://www.descript.com/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Canva AI': {
    priority: 'medium',
    pricingUrl: 'https://www.canva.com/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
  
  'Poe': {
    priority: 'medium',
    pricingUrl: 'https://poe.com/pricing',
    selectors: {
      plans: '.pricing-card, .plan',
      name: 'h3',
      price: '.price',
      features: 'ul li',
    },
    parsePrice: (text) => {
      const match = text.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : null;
    },
  },
};

// Generic scraper for tools without custom config
async function scrapeGenericPricing(url: string): Promise<any[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const plans: any[] = [];
    
    // Try common selectors
    const planSelectors = [
      '.pricing-card', '.plan-card', '.pricing-tier',
      '[class*="pricing"]', '[class*="plan"]', '[data-testid*="pricing"]'
    ];
    
    for (const selector of planSelectors) {
      $(selector).each((_, el) => {
        const $el = $(el);
        const name = $el.find('h3, h2, .plan-name, .tier-name').first().text().trim();
        const priceText = $el.find('.price, .amount, [class*="price"]').first().text().trim();
        const features = $el.find('ul li, .feature').map((_, f) => $(f).text().trim()).get();
        
        if (name && priceText) {
          const priceMatch = priceText.match(/\$?(\d+)/);
          plans.push({
            name,
            price: priceMatch ? parseInt(priceMatch[1]) : null,
            priceUnit: priceText.includes('year') ? 'year' : 'month',
            features: features.slice(0, 5),
          });
        }
      });
      
      if (plans.length > 0) break;
    }
    
    return plans;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return [];
  }
}

// Scrape pricing for a specific tool
async function scrapeToolPricing(toolName: string, config: typeof toolConfigs[string]): Promise<any[]> {
  console.log(`\n🔍 Scraping ${toolName} (${config.priority})...`);
  
  try {
    const response = await fetch(config.pricingUrl!, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      console.log(`  ⚠️ Failed: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const plans: any[] = [];
    
    $(config.selectors.plans).each((_, el) => {
      const $el = $(el);
      
      const name = config.selectors.name 
        ? $el.find(config.selectors.name).first().text().trim()
        : $el.find('h3, h2').first().text().trim();
      
      const priceText = config.selectors.price
        ? $el.find(config.selectors.price).first().text().trim()
        : $el.text();
      
      const features = config.selectors.features
        ? $el.find(config.selectors.features).map((_, f) => $(f).text().trim()).get()
        : [];
      
      const price = config.parsePrice(priceText);
      
      if (name) {
        plans.push({
          name,
          price,
          priceUnit: priceText.includes('year') ? 'year' : 'month',
          features: features.slice(0, 5),
          isPopular: $el.text().toLowerCase().includes('popular') || 
                     $el.text().toLowerCase().includes('recommended'),
        });
      }
    });
    
    console.log(`  ✅ Found ${plans.length} plans`);
    plans.forEach(p => console.log(`     - ${p.name}: $${p.price}/${p.priceUnit}`));
    
    if (config.postProcess) {
      return config.postProcess(plans);
    }
    
    return plans;
  } catch (error) {
    console.error(`  ⚠️ Error:`, error);
    return [];
  }
}

// Update tool pricing in database
async function updateToolPricing(toolName: string, plans: any[]) {
  const tool = await prisma.tool.findFirst({
    where: { name: toolName },
  });
  
  if (!tool) {
    console.log(`  ⚠️ Tool not found: ${toolName}`);
    return;
  }
  
  // Delete old plans
  await prisma.pricingPlan.deleteMany({
    where: { toolId: tool.id },
  });
  
  // Create new plans
  if (plans.length > 0) {
    await prisma.pricingPlan.createMany({
      data: plans.map((plan, idx) => ({
        toolId: tool.id,
        name: plan.name,
        price: plan.price,
        priceUnit: plan.priceUnit,
        features: plan.features || [],
        isPopular: plan.isPopular || false,
        sortOrder: idx,
      })),
    });
    
    // Update tool priceStart
    const lowestPrice = plans
      .filter(p => p.price !== null)
      .sort((a, b) => (a.price || 0) - (b.price || 0))[0]?.price;
    
    if (lowestPrice) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: { priceStart: lowestPrice },
      });
    }
  }
  
  console.log(`  ✅ Updated ${plans.length} pricing plans`);
}

// Main function
async function scrapePricing(priorityFilter?: 'high' | 'medium' | 'low') {
  console.log('=== Smart Pricing Scraper ===\n');
  
  const toolsToScrape = Object.entries(toolConfigs)
    .filter(([_, config]) => !priorityFilter || config.priority === priorityFilter);
  
  console.log(`Found ${toolsToScrape.length} tools to scrape\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const [toolName, config] of toolsToScrape) {
    const plans = await scrapeToolPricing(toolName, config);
    
    if (plans.length > 0) {
      await updateToolPricing(toolName, plans);
      success++;
    } else {
      console.log(`  ⚠️ No pricing data found`);
      failed++;
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n=== Complete ===`);
  console.log(`Success: ${success}, Failed: ${failed}`);
  
  await prisma.$disconnect();
}

// Parse command line arguments
const priority = process.argv[2] as 'high' | 'medium' | 'low' | undefined;

scrapePricing(priority).catch(console.error);

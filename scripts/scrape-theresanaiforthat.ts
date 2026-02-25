/**
 * Scraper for "There's An AI For That" (theresanaiforthat.com)
 * Extracts tool information from their public pages
 */

import { chromium, Browser, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ScrapedTool {
  name: string;
  tagline: string;
  description: string;
  website: string;
  category: string;
  pricingTier: 'FREE' | 'FREEMIUM' | 'PAID' | 'ENTERPRISE' | 'OPEN_SOURCE';
}

async function scrapeTheresAnAIForThat(limit: number = 100): Promise<ScrapedTool[]> {
  const browser: Browser = await chromium.launch({ headless: true });
  const tools: ScrapedTool[] = [];
  
  try {
    const page: Page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    console.log('Navigating to theresanaiforthat.com...');
    await page.goto('https://theresanaiforthat.com/', { waitUntil: 'networkidle' });
    
    // Wait for tools to load
    await page.waitForSelector('[data-testid="tool-card"]', { timeout: 10000 });
    
    // Extract tools
    const scrapedData = await page.evaluate((maxTools: number) => {
      const results: ScrapedTool[] = [];
      const cards = document.querySelectorAll('[data-testid="tool-card"]');
      
      cards.forEach((card, index) => {
        if (index >= maxTools) return;
        
        const nameEl = card.querySelector('h3, .tool-name');
        const taglineEl = card.querySelector('p, .tool-tagline');
        const linkEl = card.querySelector('a');
        const categoryEl = card.querySelector('.category, .tool-category');
        
        if (nameEl && linkEl) {
          results.push({
            name: nameEl.textContent?.trim() || '',
            tagline: taglineEl?.textContent?.trim() || '',
            description: taglineEl?.textContent?.trim() || '',
            website: linkEl.getAttribute('href') || '',
            category: categoryEl?.textContent?.trim() || 'Other',
            pricingTier: 'FREEMIUM', // Default, will be refined
          });
        }
      });
      
      return results;
    }, limit);
    
    tools.push(...scrapedData);
    
    console.log(`Scraped ${tools.length} tools`);
    
  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
  }
  
  return tools;
}

async function saveTools(tools: ScrapedTool[]) {
  console.log(`Saving ${tools.length} tools to database...`);
  
  for (const tool of tools) {
    try {
      // Skip if already exists (check by website)
      const existing = await prisma.tool.findFirst({
        where: { website: tool.website }
      });
      
      if (existing) {
        console.log(`Skipping existing tool: ${tool.name}`);
        continue;
      }
      
      // Find or create category
      let category = await prisma.category.findFirst({
        where: { name: { equals: tool.category, mode: 'insensitive' } }
      });
      
      if (!category) {
        category = await prisma.category.create({
          data: {
            slug: tool.category.toLowerCase().replace(/\s+/g, '-'),
            name: tool.category,
            description: `${tool.category} AI tools`,
          }
        });
        console.log(`Created category: ${tool.category}`);
      }
      
      // Create tool
      await prisma.tool.create({
        data: {
          slug: tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          name: tool.name,
          tagline: tool.tagline,
          description: tool.description,
          website: tool.website,
          categoryId: category.id,
          pricingTier: tool.pricingTier,
          isActive: true,
          trendingScore: 50, // Default score
        }
      });
      
      console.log(`Created tool: ${tool.name}`);
      
    } catch (error) {
      console.error(`Error saving tool ${tool.name}:`, error);
    }
  }
}

async function main() {
  console.log('Starting scraper...');
  
  const tools = await scrapeTheresAnAIForThat(100);
  await saveTools(tools);
  
  console.log('Scraping complete!');
  await prisma.$disconnect();
}

main().catch(console.error);

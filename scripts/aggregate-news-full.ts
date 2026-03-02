/**
 * News Aggregator with Intelligent Content Extraction
 * Uses readability algorithm to extract main article content
 */

import { PrismaClient, NewsStatus } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

// Content sources to monitor
const CONTENT_SOURCES = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog',
    rssUrl: 'https://openai.com/blog/rss.xml',
    category: 'AI Research'
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news',
    rssUrl: 'https://www.anthropic.com/news/rss.xml',
    category: 'AI Research'
  },
  {
    name: 'Google AI Blog',
    url: 'https://ai.googleblog.com',
    rssUrl: 'https://ai.googleblog.com/feeds/posts/default',
    category: 'AI Research'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
    rssUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'Industry News'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence/',
    rssUrl: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    category: 'Industry News'
  }
];

interface RawArticle {
  title: string;
  url: string;
  content: string;
  fullContent: string;
  publishedAt: Date;
  source: string;
  author?: string;
  coverImage?: string;
}

// Fetch RSS feed
async function fetchRSSFeed(source: typeof CONTENT_SOURCES[0]): Promise<RawArticle[]> {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rssUrl)}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.items) return [];
    
    return data.items.map((item: any) => ({
      title: item.title,
      url: item.link,
      content: item.content || item.description || '',
      fullContent: '',
      publishedAt: new Date(item.pubDate),
      source: source.name,
      author: item.author,
      coverImage: item.thumbnail || item.enclosure?.link || null
    }));
  } catch (error) {
    console.error(`Failed to fetch ${source.name}:`, error);
    return [];
  }
}

// Calculate text density score for an element
function getTextDensity($: cheerio.CheerioAPI, el: any): number {
  const $el = $(el);
  const text = $el.text().trim();
  const textLength = text.length;
  
  // Count links
  const linkLength = $el.find('a').text().length;
  
  // Count commas (indicator of good content)
  const commaCount = (text.match(/,/g) || []).length;
  
  // Calculate density
  const density = (textLength - linkLength) / (textLength + 1);
  
  // Bonus for paragraphs with commas
  const commaBonus = commaCount * 10;
  
  return density * textLength + commaBonus;
}

// Extract main content using readability-like algorithm
function extractMainContent($: cheerio.CheerioAPI): { element: any; score: number } | null {
  const candidates: Array<{ element: any; score: number }> = [];
  
  // Common content container selectors
  const selectors = [
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.content',
    '.post',
    '.entry',
    '#content',
    '#main-content'
  ];
  
  // Try specific selectors first
  for (const selector of selectors) {
    const el = $(selector).first();
    if (el.length) {
      const score = getTextDensity($, el[0]);
      if (score > 100) {
        candidates.push({ element: el, score });
      }
    }
  }
  
  // If no good candidates, scan all divs and sections
  if (candidates.length === 0) {
    $('div, section').each((_: any, el: any) => {
      const $el = $(el);
      
      // Skip small elements
      const text = $el.text().trim();
      if (text.length < 200) return;
      
      // Skip elements with too many links
      const linkRatio = $el.find('a').length / (text.length / 100 + 1);
      if (linkRatio > 0.5) return;
      
      // Skip navigation-like elements
      const className = ($el.attr('class') || '').toLowerCase();
      const id = ($el.attr('id') || '').toLowerCase();
      const skipPatterns = /nav|menu|sidebar|footer|header|comment|meta|tag|share|social|related|recommended/;
      if (skipPatterns.test(className) || skipPatterns.test(id)) return;
      
      const score = getTextDensity($, el);
      if (score > 100) {
        candidates.push({ element: $el, score });
      }
    });
  }
  
  // Return best candidate
  if (candidates.length === 0) return null;
  
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

// Clean and format extracted content
function cleanContent($: cheerio.CheerioAPI, contentEl: any, baseUrl: string): { content: string; images: string[] } {
  // Clone to avoid modifying original
  const $content = contentEl.clone();
  
  // Remove unwanted elements
  const elementsToRemove = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    'aside',
    '.ads',
    '.advertisement',
    '.social-share',
    '.share',
    '.sharing',
    '.comments',
    '.comment',
    '.loading',
    '.loader',
    '.spinner',
    '.subscribe',
    '.newsletter',
    '.popup',
    '.modal',
    '.overlay',
    '.cookie-banner',
    '.gdpr',
    '.related-posts',
    '.recommended',
    '.read-more',
    '.author-bio',
    '.post-meta',
    '.post-tags',
    '.breadcrumb',
    '.sidebar',
    '.widget',
    '.pagination',
    '.nav-links',
    '[class*="share"]',
    '[class*="social"]',
    '[class*="loading"]',
    '[class*="subscribe"]',
    '[id*="share"]',
    '[id*="social"]',
    '[id*="loading"]',
    '[id*="subscribe"]'
  ];
  
  $content.find(elementsToRemove.join(', ')).remove();
  
  // Clean up each element
  const images: string[] = [];
  
  $content.find('*').each((_: any, el: any) => {
    const $el = $(el);
    
    // Remove empty elements (except br, hr, img)
    const tagName = el.tagName.toLowerCase();
    if (!['br', 'hr', 'img'].includes(tagName)) {
      const text = $el.text().trim();
      if (text === '' && $el.children().length === 0) {
        $el.remove();
        return;
      }
    }
    
    // Clean up attributes
    const attrs = Object.keys(el.attribs || {});
    attrs.forEach(attr => {
      if (attr.startsWith('data-') || 
          attr.startsWith('on') || 
          attr === 'style' ||
          attr === 'class' && /loading|spinner|share|social|subscribe/i.test($el.attr('class') || '')) {
        $el.removeAttr(attr);
      }
    });
    
    // Handle images
    if (tagName === 'img') {
      let src = $el.attr('src') || $el.attr('data-src') || $el.attr('data-lazy-src');
      if (src) {
        // Skip small icons and avatars
        const width = parseInt($el.attr('width') || '0');
        const height = parseInt($el.attr('height') || '0');
        if ((width > 0 && width < 100) || (height > 0 && height < 100)) {
          if (src.includes('icon') || src.includes('avatar') || src.includes('logo')) {
            $el.remove();
            return;
          }
        }
        
        // Make URL absolute
        const absoluteUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        images.push(absoluteUrl);
        $el.attr('src', absoluteUrl);
        
        // Clean up image attributes
        $el.removeAttr('data-src data-lazy-src loading width height class style');
        
        // Add alt text if missing
        if (!$el.attr('alt')) {
          $el.attr('alt', 'Article image');
        }
      } else {
        $el.remove();
      }
    }
    
    // Convert divs with only text to paragraphs
    if (tagName === 'div' && $el.children().length === 0) {
      const text = $el.text().trim();
      if (text.length > 50 && !text.includes('<')) {
        $el.replaceWith(`<p>${text}</p>`);
      }
    }
  });
  
  // Get the cleaned HTML
  let content = $content.html() || '';
  
  // Final cleanup
  content = content
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
  
  return { content, images };
}

// Fetch and extract article content
async function fetchArticleContent(url: string): Promise<{ content: string; images: string[] }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`  ⚠️ Failed to fetch ${url}: ${response.status}`);
      return { content: '', images: [] };
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove script and style tags first
    $('script, style, noscript').remove();
    
    // Extract main content
    const result = extractMainContent($);
    
    if (!result) {
      console.log(`  ⚠️ Could not extract main content from ${url}`);
      return { content: '', images: [] };
    }
    
    console.log(`  📊 Content score: ${Math.round(result.score)}`);
    
    // Clean and format the content
    const { content, images } = cleanContent($, result.element, url);
    
    if (content.length < 500) {
      console.log(`  ⚠️ Extracted content too short (${content.length} chars)`);
      return { content: '', images: [] };
    }
    
    console.log(`  ✅ Extracted: ${content.length} chars, ${images.length} images`);
    return { content, images };
    
  } catch (error) {
    console.error(`  ⚠️ Error fetching ${url}:`, error);
    return { content: '', images: [] };
  }
}

// Find mentioned tools in article
async function findMentionedTools(content: string, title: string) {
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true }
  });
  
  const mentioned: any[] = [];
  const fullText = (title + ' ' + content).toLowerCase();
  
  for (const tool of tools) {
    const nameLower = tool.name.toLowerCase();
    const escapedName = nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
    const matches = fullText.match(regex);
    
    if (matches && matches.length > 0) {
      mentioned.push({ toolId: tool.id, toolName: tool.name, mentions: matches.length });
    }
  }
  
  return mentioned.sort((a, b) => b.mentions - a.mentions).slice(0, 5);
}

// Generate slug
function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100);
}

// Check for duplicate
async function isDuplicate(url: string, title: string): Promise<boolean> {
  const existing = await prisma.news.findFirst({
    where: {
      OR: [
        { originalUrl: url },
        { title: { equals: title, mode: 'insensitive' } }
      ]
    }
  });
  return !!existing;
}

// Main aggregation function - Daily limit: 5 articles
async function aggregateNews() {
  console.log('🔄 Fetching news articles with intelligent content extraction...\n');
  
  // Check already pending articles
  const pendingCount = await prisma.news.count({
    where: { status: NewsStatus.PENDING }
  });
  
  const dailyLimit = 5;
  const remainingSlots = dailyLimit - pendingCount;
  
  if (remainingSlots <= 0) {
    console.log(`⏸️ Already have ${pendingCount} articles pending review.`);
    console.log('   Please process existing articles before fetching more.\n');
    await prisma.$disconnect();
    return;
  }
  
  console.log(`📋 Daily limit: ${dailyLimit} articles`);
  console.log(`   Pending: ${pendingCount}, Can fetch: ${remainingSlots}\n`);
  
  let totalFound = 0;
  let totalSaved = 0;
  const savedArticles: Array<{title: string, id: string, tools: string[]}> = [];
  
  for (const source of CONTENT_SOURCES) {
    if (totalSaved >= remainingSlots) {
      console.log('✅ Daily limit reached. Stopping fetch.\n');
      break;
    }
    
    console.log(`📡 Fetching from ${source.name}...`);
    const articles = await fetchRSSFeed(source);
    console.log(`  Found ${articles.length} articles`);
    
    for (const article of articles.slice(0, 3)) {
      if (totalSaved >= remainingSlots) break;
      
      if (await isDuplicate(article.url, article.title)) {
        console.log(`  ⏭️ Duplicate: ${article.title.substring(0, 50)}...`);
        continue;
      }
      
      console.log(`  📄 Extracting: ${article.title.substring(0, 50)}...`);
      
      // Extract article content using intelligent algorithm
      const { content: extractedContent, images } = await fetchArticleContent(article.url);
      
      if (!extractedContent) {
        console.log(`  ⚠️ Failed to extract content, using RSS summary`);
        article.fullContent = article.content;
      } else {
        article.fullContent = extractedContent;
      }
      
      // Use first image as cover if available
      const coverImage = article.coverImage || images[0] || null;
      
      const mentionedTools = await findMentionedTools(article.fullContent, article.title);
      
      // Save to database with PENDING status
      const news = await prisma.news.create({
        data: {
          slug: generateSlug(article.title),
          title: article.title,
          excerpt: article.content.substring(0, 300) + '...',
          content: article.fullContent,
          coverImage: coverImage,
          originalUrl: article.url,
          source: article.source,
          status: NewsStatus.PENDING,
          isPublished: false,
          publishedAt: article.publishedAt
        }
      });
      
      // Store tool mentions
      for (const mention of mentionedTools) {
        await prisma.$executeRaw`
          INSERT INTO "NewsToolMention" ("id", "newsId", "toolId", "mentions", "createdAt")
          VALUES (
            gen_random_uuid()::text,
            ${news.id},
            ${mention.toolId},
            ${mention.mentions},
            NOW()
          )
          ON CONFLICT DO NOTHING
        `;
      }
      
      totalSaved++;
      savedArticles.push({
        title: article.title,
        id: news.id,
        tools: mentionedTools.map(t => t.toolName)
      });
      
      console.log(`  ✅ Saved: ${article.title.substring(0, 60)}...`);
      if (mentionedTools.length > 0) {
        console.log(`     🔗 Tools: ${mentionedTools.map(t => t.toolName).join(', ')}`);
      }
      
      // Small delay to be polite to servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    totalFound += articles.length;
  }
  
  // Generate summary report
  console.log(`\n========================================`);
  console.log(`📊 Summary: ${totalFound} found, ${totalSaved} saved to database`);
  console.log(`========================================\n`);
  
  if (savedArticles.length > 0) {
    console.log('📝 Articles saved for review:\n');
    savedArticles.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ID: ${item.id}`);
      if (item.tools.length > 0) {
        console.log(`   Tools: ${item.tools.join(', ')}`);
      }
      console.log('');
    });
    
    console.log('👉 Next step: Review articles at /admin/news/review');
  }
  
  await prisma.$disconnect();
}

aggregateNews().catch(console.error);

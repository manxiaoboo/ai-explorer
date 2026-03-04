/**
 * News Aggregator with Playwright - Full Content Version
 * Uses Playwright to fetch complete article content from source websites
 */

import { PrismaClient, NewsStatus } from '@prisma/client';
import { chromium } from 'playwright';

const prisma = new PrismaClient();

// Content sources to monitor
const CONTENT_SOURCES = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog',
    rssUrl: 'https://openai.com/blog/rss.xml',
    category: 'AI Research',
    contentSelector: 'article, .post-content, .prose, main'
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news',
    rssUrl: 'https://www.anthropic.com/news/rss.xml',
    category: 'AI Research',
    contentSelector: 'article, .post-content, .prose, [class*="content"]'
  },
  {
    name: 'Google AI Blog',
    url: 'https://ai.googleblog.com',
    rssUrl: 'https://ai.googleblog.com/feeds/posts/default',
    category: 'AI Research',
    contentSelector: '.post-body, .entry-content, article'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
    rssUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'Industry News',
    contentSelector: 'article, .article-content, .post-content, [class*="article"]'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence',
    rssUrl: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    category: 'Industry News',
    contentSelector: 'article, .c-entry-content, .prose, [class*="content"]'
  }
];

interface RawArticle {
  title: string;
  url: string;
  content: string;
  publishedAt: Date;
  source: string;
  author?: string;
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
      publishedAt: new Date(item.pubDate),
      source: source.name,
      author: item.author
    }));
  } catch (error) {
    console.error(`Failed to fetch ${source.name}:`, error);
    return [];
  }
}

// Format content for better readability
function formatContent(content: string): string {
  if (!content) return '';
  
  // Step 1: Normalize line endings
  let formatted = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Step 2: Preserve paragraph breaks but normalize excessive whitespace
  formatted = formatted
    .replace(/\n{4,}/g, '\n\n\n')  // Max 2 blank lines between paragraphs
    .replace(/[ \t]+/g, ' ');       // Normalize horizontal spaces
  
  // Step 3: Add proper spacing around common section markers
  const sectionMarkers = [
    'Introduction', 'Overview', 'Summary', 'Conclusion',
    'Key Points', 'Highlights', 'What\'s New', 'Features',
    'Benefits', 'How It Works', 'Getting Started',
    'About', 'Background', 'Details', 'Analysis'
  ];
  
  for (const marker of sectionMarkers) {
    const regex = new RegExp(`(^|\n)(${marker})[:\s]*\n`, 'gi');
    formatted = formatted.replace(regex, '\n\n$2\n');
  }
  
  // Step 4: Ensure proper paragraph separation
  // Split into paragraphs and rejoin with consistent spacing
  const paragraphs = formatted
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  // Group short lines that might be part of the same paragraph
  const grouped: string[] = [];
  let currentGroup = '';
  
  for (const para of paragraphs) {
    // If paragraph ends with sentence-ending punctuation, it's complete
    const isCompleteSentence = /[.!?。！？]$/.test(para);
    const isShortLine = para.length < 100;
    const isListItem = /^[\d•·\-\*•]/.test(para);
    const isHeader = para.length < 50 && /^[A-Z]/.test(para) && !para.includes('.');
    
    if (isHeader) {
      if (currentGroup) {
        grouped.push(currentGroup.trim());
        currentGroup = '';
      }
      grouped.push('\n' + para + '\n');
    } else if (isListItem) {
      if (currentGroup) {
        grouped.push(currentGroup.trim());
        currentGroup = '';
      }
      grouped.push(para);
    } else if (isShortLine && !isCompleteSentence) {
      currentGroup += ' ' + para;
    } else {
      currentGroup += ' ' + para;
      if (isCompleteSentence || currentGroup.length > 200) {
        grouped.push(currentGroup.trim());
        currentGroup = '';
      }
    }
  }
  
  if (currentGroup) {
    grouped.push(currentGroup.trim());
  }
  
  // Step 5: Join with generous spacing
  formatted = grouped
    .map(p => {
      // Add extra line break after headers
      if (/^\n/.test(p)) {
        return p + '\n';
      }
      return p;
    })
    .join('\n\n');
  
  // Step 6: Add visual breathing room for long articles
  // Insert a separator every ~1000 characters for very long content
  const parts: string[] = [];
  let currentPart = '';
  const lines = formatted.split('\n');
  
  for (const line of lines) {
    currentPart += line + '\n';
    if (currentPart.length > 800 && /^[A-Z]/.test(line)) {
      parts.push(currentPart.trim());
      currentPart = '';
    }
  }
  if (currentPart) {
    parts.push(currentPart.trim());
  }
  
  formatted = parts.join('\n\n');
  
  // Step 7: Final cleanup
  formatted = formatted
    .replace(/\n{5,}/g, '\n\n\n\n')  // Max 3 blank lines
    .trim();
  
  return formatted;
}

// Fetch full article content using Playwright
async function fetchFullContent(url: string, selectors: string[]): Promise<string> {
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });
    
    // Inject script to hide automation
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });
    
    const page = await context.newPage();
    
    // Navigate with shorter timeout
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    
    if (!response || response.status() >= 400) {
      console.log(`     ⚠️ HTTP ${response?.status() || 'error'}`);
    }
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Try to extract content using selectors
    let content = '';
    for (const selector of selectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          const text = await element.innerText().catch(() => '');
          if (text.length > content.length && text.length > 200) {
            content = text;
          }
        }
        if (content.length > 1000) break;
      } catch {
        continue;
      }
    }
    
    // Fallback: extract all paragraphs
    if (content.length < 500) {
      try {
        const paragraphs = await page.locator('p').allInnerTexts();
        content = paragraphs.filter(p => p.length > 50).join('\n\n');
      } catch {
        // ignore
      }
    }
    
    // Clean up and format content with better readability
    content = formatContent(content);
    
    return content;
  } catch (error) {
    console.error(`     ❌ Failed: ${(error as Error).message.substring(0, 80)}`);
    return '';
  } finally {
    if (browser) {
      await browser.close();
    }
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
  console.log('🔄 Fetching news articles with Playwright...\n');
  
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
  const savedArticles: Array<{title: string, id: string, tools: string[], contentLength: number}> = [];
  
  for (const source of CONTENT_SOURCES) {
    if (totalSaved >= remainingSlots) {
      console.log('✅ Daily limit reached. Stopping fetch.\n');
      break;
    }
    
    console.log(`📡 Fetching from ${source.name}...`);
    const articles = await fetchRSSFeed(source);
    console.log(`  Found ${articles.length} articles in RSS`);
    
    for (const article of articles.slice(0, 3)) { // Max 3 per source
      if (totalSaved >= remainingSlots) break;
      
      if (await isDuplicate(article.url, article.title)) {
        console.log(`  ⏭️ Duplicate: ${article.title.substring(0, 50)}...`);
        continue;
      }
      
      console.log(`  🔍 Fetching full content: ${article.title.substring(0, 50)}...`);
      
      // Fetch full content with Playwright
      const fullContent = await fetchFullContent(article.url, [
        source.contentSelector,
        'article',
        'main',
        '.content'
      ]);
      
      // Use full content if available, otherwise fallback to RSS content
      const finalContent = fullContent.length > 500 ? fullContent : article.content;
      
      console.log(`     📄 Content length: ${finalContent.length} chars`);
      
      const mentionedTools = await findMentionedTools(finalContent, article.title);
      
      // Save to database with PENDING status
      const news = await prisma.news.create({
        data: {
          slug: generateSlug(article.title),
          title: article.title,
          excerpt: finalContent.substring(0, 200) + '...',
          content: finalContent,
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
        tools: mentionedTools.map(t => t.toolName),
        contentLength: finalContent.length
      });
      
      console.log(`  ✅ Saved: ${article.title.substring(0, 60)}...`);
      if (mentionedTools.length > 0) {
        console.log(`     🔗 Tools: ${mentionedTools.map(t => t.toolName).join(', ')}`);
      }
      
      // Small delay to be nice to servers
      await new Promise(r => setTimeout(r, 1000));
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
      console.log(`   Content: ${item.contentLength} chars`);
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

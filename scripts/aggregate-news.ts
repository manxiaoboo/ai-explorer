/**
 * News Aggregator with Playwright - SEO Optimized Version
 * Uses Playwright to fetch complete article content from source websites
 * Enhanced for Google Content Warehouse API SEO standards
 */

import { PrismaClient, NewsStatus } from '@prisma/client';
import { chromium } from 'playwright';

const prisma = new PrismaClient();

// Content sources to monitor - Expanded for better coverage
const CONTENT_SOURCES = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog',
    rssUrl: 'https://openai.com/blog/rss.xml',
    category: 'AI Research',
    contentSelector: 'article, .post-content, .prose, main',
    priority: 1
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news',
    rssUrl: 'https://www.anthropic.com/news/rss.xml',
    category: 'AI Research',
    contentSelector: 'article, .post-content, .prose, [class*="content"]',
    priority: 1
  },
  {
    name: 'Google AI Blog',
    url: 'https://ai.googleblog.com',
    rssUrl: 'https://ai.googleblog.com/feeds/posts/default',
    category: 'AI Research',
    contentSelector: '.post-body, .entry-content, article',
    priority: 1
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
    rssUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'Industry News',
    contentSelector: 'article, .article-content, .post-content, [class*="article"]',
    priority: 2
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence',
    rssUrl: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    category: 'Industry News',
    contentSelector: 'article, .c-entry-content, .prose, [class*="content"]',
    priority: 2
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com',
    rssUrl: 'https://www.technologyreview.com/feed/',
    category: 'AI Research',
    contentSelector: 'article, .content-body, [class*="article-content"]',
    priority: 1
  },
  {
    name: 'AI Alignment Forum',
    url: 'https://alignmentforum.org',
    rssUrl: 'https://alignmentforum.org/feed.xml',
    category: 'AI Safety',
    contentSelector: '.PostsPageContent, .ContentItemBody, article',
    priority: 2
  }
];

interface RawArticle {
  title: string;
  url: string;
  content: string;
  publishedAt: Date;
  source: string;
  author?: string;
  imageUrl?: string;
}

// Fetch RSS feed with enhanced error handling
async function fetchRSSFeed(source: typeof CONTENT_SOURCES[0]): Promise<RawArticle[]> {
  try {
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rssUrl)}`,
      { timeout: 15000 } as any
    );
    
    if (!response.ok) {
      console.log(`  ⚠️ RSS fetch failed for ${source.name}: HTTP ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    if (!data.items || !Array.isArray(data.items)) {
      console.log(`  ⚠️ No items found in RSS for ${source.name}`);
      return [];
    }
    
    // Filter articles from last 7 days only
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return data.items
      .filter((item: any) => {
        const pubDate = new Date(item.pubDate);
        return pubDate >= sevenDaysAgo;
      })
      .map((item: any) => ({
        title: item.title?.trim() || '',
        url: item.link,
        content: item.content || item.description || '',
        publishedAt: new Date(item.pubDate),
        source: source.name,
        author: item.author,
        imageUrl: item.enclosure?.link || item.thumbnail
      }));
  } catch (error) {
    console.error(`  ❌ Failed to fetch ${source.name}:`, (error as Error).message);
    return [];
  }
}

// SEO-optimized content formatting
function formatContent(content: string): string {
  if (!content) return '';
  
  // Step 1: Normalize line endings
  let formatted = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Step 2: Remove script and style tags content
  formatted = formatted.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  formatted = formatted.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Step 3: Convert HTML entities
  formatted = formatted
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Step 4: Remove HTML tags but preserve structure
  formatted = formatted.replace(/<[^>]+>/g, ' ');
  
  // Step 5: Normalize whitespace
  formatted = formatted
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +/g, ' ');
  
  // Step 6: Add proper spacing around section markers (SEO enhancement)
  const sectionMarkers = [
    'Introduction', 'Overview', 'Summary', 'Conclusion',
    'Key Points', 'Highlights', 'What\'s New', 'Features',
    'Benefits', 'How It Works', 'Getting Started', 'Quick Start',
    'About', 'Background', 'Details', 'Analysis', 'Key Takeaways'
  ];
  
  for (const marker of sectionMarkers) {
    const regex = new RegExp(`(^|\n)(${marker})[:\s]*\n`, 'gi');
    formatted = formatted.replace(regex, '\n\n## $2\n\n');
  }
  
  // Step 7: Ensure proper paragraph separation
  const paragraphs = formatted
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  const grouped: string[] = [];
  let currentGroup = '';
  
  for (const para of paragraphs) {
    const isCompleteSentence = /[.!?。！？]$/.test(para);
    const isShortLine = para.length < 100;
    const isListItem = /^[\d•·\-\*•]/.test(para);
    const isHeader = para.length < 60 && /^[A-Z#]/.test(para) && !para.includes('.');
    
    if (isHeader) {
      if (currentGroup) {
        grouped.push(currentGroup.trim());
        currentGroup = '';
      }
      grouped.push(para);
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
      if (isCompleteSentence || currentGroup.length > 250) {
        grouped.push(currentGroup.trim());
        currentGroup = '';
      }
    }
  }
  
  if (currentGroup) {
    grouped.push(currentGroup.trim());
  }
  
  // Step 8: Join with proper spacing
  formatted = grouped.join('\n\n');
  
  // Step 9: Final cleanup
  formatted = formatted
    .replace(/\n{5,}/g, '\n\n\n\n')
    .trim();
  
  return formatted;
}

// Extract meta description from content (SEO enhancement)
function extractMetaDescription(content: string, maxLength: number = 160): string {
  // Remove markdown-style headers
  const cleanContent = content.replace(/^#+\s+/gm, '');
  
  // Get first substantial sentence
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 50);
  
  if (sentences.length === 0) {
    return content.substring(0, maxLength).trim() + '...';
  }
  
  let description = sentences[0].trim();
  
  // Ensure it ends properly
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3).trim() + '...';
  }
  
  return description;
}

// Fetch full article content using Playwright
async function fetchFullContent(url: string, selectors: string[]): Promise<{ content: string; imageUrl?: string }> {
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });
    
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });
    
    const page = await context.newPage();
    
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 25000 
    });
    
    if (!response || response.status() >= 400) {
      console.log(`     ⚠️ HTTP ${response?.status() || 'error'}`);
    }
    
    // Wait for content
    await page.waitForTimeout(2000);
    
    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Extract main image
    let imageUrl: string | undefined;
    try {
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      if (ogImage) imageUrl = ogImage;
    } catch {}
    
    if (!imageUrl) {
      try {
        const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
        if (twitterImage) imageUrl = twitterImage;
      } catch {}
    }
    
    // Extract content
    let content = '';
    for (const selector of selectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          const text = await element.innerText().catch(() => '');
          if (text.length > content.length && text.length > 300) {
            content = text;
          }
        }
        if (content.length > 1500) break;
      } catch {
        continue;
      }
    }
    
    // Fallback
    if (content.length < 800) {
      try {
        const paragraphs = await page.locator('p').allInnerTexts();
        content = paragraphs.filter(p => p.length > 40).join('\n\n');
      } catch {}
    }
    
    content = formatContent(content);
    
    return { content, imageUrl };
  } catch (error) {
    console.error(`     ❌ Failed: ${(error as Error).message.substring(0, 100)}`);
    return { content: '' };
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
    // Skip very short names to avoid false positives
    if (nameLower.length < 3) continue;
    
    const escapedName = nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
    const matches = fullText.match(regex);
    
    if (matches && matches.length > 0) {
      mentioned.push({ toolId: tool.id, toolName: tool.name, mentions: matches.length });
    }
  }
  
  return mentioned.sort((a, b) => b.mentions - a.mentions).slice(0, 5);
}

// Generate SEO-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
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

// Calculate content quality score (SEO enhancement)
function calculateContentQuality(content: string): number {
  let score = 0;
  
  // Length score (optimal: 1000-3000 chars)
  if (content.length >= 1000) score += 30;
  else if (content.length >= 500) score += 20;
  else if (content.length >= 300) score += 10;
  
  // Paragraph structure
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length >= 5) score += 20;
  else if (paragraphs.length >= 3) score += 10;
  
  // Headers presence
  if (content.includes('## ')) score += 20;
  
  // Sentence variety
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 10) score += 20;
  else if (sentences.length >= 5) score += 10;
  
  // No excessive repetition
  const words = content.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const diversity = uniqueWords.size / words.length;
  if (diversity > 0.4) score += 10;
  
  return Math.min(score, 100);
}

// Main aggregation function - SEO optimized
async function aggregateNews() {
  console.log('🔄 SEO-Optimized News Aggregator\n');
  console.log('=====================================\n');
  
  // Check pending articles
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
  let totalSkipped = 0;
  const savedArticles: Array<{
    title: string;
    id: string;
    tools: string[];
    contentLength: number;
    qualityScore: number;
    source: string;
  }> = [];
  
  // Sort sources by priority
  const sortedSources = [...CONTENT_SOURCES].sort((a, b) => a.priority - b.priority);
  
  for (const source of sortedSources) {
    if (totalSaved >= remainingSlots) {
      console.log('✅ Daily limit reached. Stopping fetch.\n');
      break;
    }
    
    console.log(`📡 [${source.priority}] ${source.name}`);
    const articles = await fetchRSSFeed(source);
    console.log(`   Found ${articles.length} recent articles`);
    
    // Sort by relevance - prioritize articles mentioning AI tools
    const articlesWithMentions = await Promise.all(
      articles.slice(0, 5).map(async (article) => {
        const mentionedTools = await findMentionedTools(article.content, article.title);
        return { article, mentionedTools, relevanceScore: mentionedTools.length };
      })
    );
    
    // Sort by relevance score
    articlesWithMentions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    for (const { article, mentionedTools } of articlesWithMentions) {
      if (totalSaved >= remainingSlots) break;
      
      if (await isDuplicate(article.url, article.title)) {
        console.log(`   ⏭️ Duplicate: ${article.title.substring(0, 45)}...`);
        totalSkipped++;
        continue;
      }
      
      console.log(`   🔍 ${article.title.substring(0, 50)}...`);
      
      // Fetch full content
      const { content: fullContent, imageUrl } = await fetchFullContent(article.url, [
        source.contentSelector,
        'article',
        'main',
        '.content',
        '[role="main"]'
      ]);
      
      // Use full content if substantial
      const finalContent = fullContent.length > 800 
        ? fullContent 
        : formatContent(article.content);
      
      // Quality check
      const qualityScore = calculateContentQuality(finalContent);
      console.log(`      📄 Length: ${finalContent.length} chars | Quality: ${qualityScore}/100`);
      
      // Skip low quality content
      if (qualityScore < 30) {
        console.log(`      ⚠️ Low quality, skipping`);
        totalSkipped++;
        continue;
      }
      
      // Generate SEO-optimized excerpt
      const excerpt = extractMetaDescription(finalContent, 200);
      
      // Generate meta title
      const metaTitle = article.title.length > 60 
        ? article.title.substring(0, 57) + '...'
        : article.title;
      
      // Save to database
      const news = await prisma.news.create({
        data: {
          slug: generateSlug(article.title),
          title: article.title,
          excerpt: excerpt,
          content: finalContent,
          coverImage: imageUrl || null,
          originalUrl: article.url,
          source: article.source,
          status: NewsStatus.PENDING,
          isPublished: false,
          publishedAt: article.publishedAt,
          metaTitle: `${metaTitle} | Atooli AI News`,
          metaDescription: excerpt
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
        contentLength: finalContent.length,
        qualityScore,
        source: article.source
      });
      
      console.log(`      ✅ Saved (Quality: ${qualityScore})`);
      if (mentionedTools.length > 0) {
        console.log(`      🔗 Tools: ${mentionedTools.map(t => t.toolName).join(', ')}`);
      }
      
      // Delay between requests
      await new Promise(r => setTimeout(r, 1500));
    }
    
    totalFound += articles.length;
    console.log('');
  }
  
  // Summary report
  console.log('=====================================');
  console.log('📊 EXECUTION SUMMARY');
  console.log('=====================================\n');
  console.log(`Articles found:    ${totalFound}`);
  console.log(`Articles saved:    ${totalSaved}`);
  console.log(`Duplicates skipped: ${totalSkipped}`);
  console.log(`Quality threshold: 30/100\n`);
  
  if (savedArticles.length > 0) {
    console.log('📝 SAVED ARTICLES:\n');
    savedArticles.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   Source: ${item.source}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Content: ${item.contentLength} chars | Quality: ${item.qualityScore}/100`);
      if (item.tools.length > 0) {
        console.log(`   Related Tools: ${item.tools.join(', ')}`);
      }
      console.log('');
    });
    
    console.log('👉 Next: Review at /admin/news/review');
    console.log('   Then publish to activate SEO benefits\n');
  } else {
    console.log('⚠️ No articles saved today.');
    console.log('   Possible reasons:');
    console.log('   - All articles were duplicates');
    console.log('   - Content quality below threshold');
    console.log('   - RSS sources temporarily unavailable\n');
  }
  
  await prisma.$disconnect();
}

// Execute
aggregateNews().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

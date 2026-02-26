/**
 * News Aggregator with Full Content Extraction
 * Fetches full article content from original URLs
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
    category: 'AI Research',
    contentSelector: 'article, .post-content, .blog-content, main'
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news',
    rssUrl: 'https://www.anthropic.com/news/rss.xml',
    category: 'AI Research',
    contentSelector: 'article, .post-content, main'
  },
  {
    name: 'Google AI Blog',
    url: 'https://ai.googleblog.com',
    rssUrl: 'https://ai.googleblog.com/feeds/posts/default',
    category: 'AI Research',
    contentSelector: '.post-body, article, .entry-content'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
    rssUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'Industry News',
    contentSelector: 'article, .article-content, .post-content'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence/',
    rssUrl: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    category: 'Industry News',
    contentSelector: '.c-entry-content, article, main'
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
      fullContent: '', // Will be fetched separately
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

// Fetch full article content from original URL
async function fetchFullContent(url: string, contentSelector: string): Promise<{ content: string; images: string[] }> {
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
    
    // Remove unwanted elements - comprehensive list
    const elementsToRemove = [
      'script',
      'style',
      'nav',
      'header',
      'footer',
      '.ads',
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
      '[class*="share"]',
      '[class*="social"]',
      '[class*="loading"]',
      '[class*="subscribe"]',
      '[id*="share"]',
      '[id*="social"]',
      '[id*="loading"]',
      '[id*="subscribe"]'
    ];
    
    $(elementsToRemove.join(', ')).remove();
    
    // Try to find main content
    let contentEl = $(contentSelector).first();
    
    // Fallback selectors if primary doesn't work
    if (!contentEl.length) {
      contentEl = $('article').first();
    }
    if (!contentEl.length) {
      contentEl = $('main').first();
    }
    if (!contentEl.length) {
      contentEl = $('.content, .post, .entry').first();
    }
    if (!contentEl.length) {
      contentEl = $('body');
    }
    
    // Remove empty elements and unwanted attributes
    contentEl.find('*').each((_, el) => {
      const $el = $(el);
      // Remove empty paragraphs
      if ($el.is('p') && $el.text().trim() === '') {
        $el.remove();
        return;
      }
      // Remove data attributes
      const attrs = Object.keys(el.attribs || {});
      attrs.forEach(attr => {
        if (attr.startsWith('data-') || attr === 'onclick' || attr === 'onload') {
          $el.removeAttr(attr);
        }
      });
      // Remove class attributes that contain certain keywords
      const classAttr = $el.attr('class');
      if (classAttr && /loading|spinner|share|social|subscribe/i.test(classAttr)) {
        $el.removeAttr('class');
      }
    });
    
    // Extract images
    const images: string[] = [];
    contentEl.find('img').each((_, img) => {
      const src = $(img).attr('src') || $(img).attr('data-src');
      if (src && !src.includes('avatar') && !src.includes('icon') && !src.includes('logo')) {
        // Make relative URLs absolute
        const absoluteUrl = src.startsWith('http') ? src : new URL(src, url).href;
        images.push(absoluteUrl);
        // Update img src in content and clean up attributes
        $(img).attr('src', absoluteUrl);
        $(img).removeAttr('data-src data-lazy-src loading');
      }
    });
    
    // Clean up the content
    let content = contentEl.html() || '';
    
    // Remove empty paragraphs and excessive whitespace
    content = content
      .replace(/<p>\s*<\/p>/gi, '')
      .replace(/<div>\s*<\/div>/gi, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
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
  console.log('🔄 Fetching news articles with full content...\n');
  
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
    
    for (const article of articles.slice(0, 3)) { // Max 3 per source
      if (totalSaved >= remainingSlots) break;
      
      if (await isDuplicate(article.url, article.title)) {
        console.log(`  ⏭️ Duplicate: ${article.title.substring(0, 50)}...`);
        continue;
      }
      
      console.log(`  📄 Fetching full content: ${article.title.substring(0, 50)}...`);
      
      // Fetch full content from original URL
      const { content: fullContent, images } = await fetchFullContent(article.url, source.contentSelector);
      
      if (!fullContent || fullContent.length < 500) {
        console.log(`  ⚠️ Content too short or failed to fetch, using RSS content`);
        article.fullContent = article.content;
      } else {
        article.fullContent = fullContent;
        console.log(`  ✅ Full content fetched: ${fullContent.length} chars, ${images.length} images`);
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
      
      console.log(`  ✅ Saved to database: ${article.title.substring(0, 60)}...`);
      if (mentionedTools.length > 0) {
        console.log(`     🔗 Tools found: ${mentionedTools.map(t => t.toolName).join(', ')}`);
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

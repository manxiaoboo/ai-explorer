/**
 * News Aggregator - Fetch Only
 * Saves raw articles for manual AI analysis
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Content sources to monitor
const CONTENT_SOURCES = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog',
    category: 'AI Research'
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news',
    category: 'AI Research'
  },
  {
    name: 'Google AI Blog',
    url: 'https://ai.googleblog.com',
    category: 'AI Research'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'Industry News'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    category: 'Industry News'
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
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`);
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

// Save pending article for manual review
async function savePendingArticle(article: RawArticle, mentionedTools: any[]) {
  const slug = generateSlug(article.title);
  
  // Create pending review file
  const reviewDir = path.join(process.cwd(), 'pending-reviews');
  if (!fs.existsSync(reviewDir)) {
    fs.mkdirSync(reviewDir, { recursive: true });
  }
  
  const reviewFile = path.join(reviewDir, `${slug}.json`);
  
  const reviewData = {
    slug,
    title: article.title,
    originalUrl: article.url,
    source: article.source,
    author: article.author,
    publishedAt: article.publishedAt,
    content: article.content,
    mentionedTools,
    fetchedAt: new Date().toISOString(),
    status: 'pending_ai_analysis'
  };
  
  fs.writeFileSync(reviewFile, JSON.stringify(reviewData, null, 2));
  
  return reviewFile;
}

// Main aggregation function
async function aggregateNews() {
  console.log('🔄 Fetching news articles...\n');
  
  let totalFound = 0;
  let totalPending = 0;
  const pendingList: Array<{title: string, file: string, tools: string[]}> = [];
  
  for (const source of CONTENT_SOURCES) {
    console.log(`📡 Fetching from ${source.name}...`);
    const articles = await fetchRSSFeed(source);
    console.log(`  Found ${articles.length} articles`);
    
    for (const article of articles.slice(0, 5)) {
      if (await isDuplicate(article.url, article.title)) {
        console.log(`  ⏭️ Duplicate: ${article.title.substring(0, 50)}...`);
        continue;
      }
      
      const mentionedTools = await findMentionedTools(article.content, article.title);
      
      // Save for manual AI analysis
      const reviewFile = await savePendingArticle(article, mentionedTools);
      
      totalPending++;
      pendingList.push({
        title: article.title,
        file: reviewFile,
        tools: mentionedTools.map(t => t.toolName)
      });
      
      console.log(`  ✅ Saved for review: ${article.title.substring(0, 60)}...`);
      if (mentionedTools.length > 0) {
        console.log(`     🔗 Tools found: ${mentionedTools.map(t => t.toolName).join(', ')}`);
      }
    }
    
    totalFound += articles.length;
  }
  
  // Generate summary report
  console.log(`\n========================================`);
  console.log(`📊 Summary: ${totalFound} found, ${totalPending} pending review`);
  console.log(`========================================\n`);
  
  if (pendingList.length > 0) {
    console.log('📝 Pending Articles for AI Analysis:\n');
    pendingList.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   File: ${item.file}`);
      if (item.tools.length > 0) {
        console.log(`   Tools: ${item.tools.join(', ')}`);
      }
      console.log('');
    });
    
    console.log('👉 Next step: Run AI analysis on these articles');
    console.log('   Command: npx tsx scripts/process-pending-articles.ts');
  }
  
  await prisma.$disconnect();
}

aggregateNews().catch(console.error);

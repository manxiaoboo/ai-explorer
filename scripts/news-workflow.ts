import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';
import { slugify } from '@/lib/utils';

const prisma = new PrismaClient();
const rssParser = new Parser();

const RSS_FEEDS = [
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' },
  { name: 'Anthropic News', url: 'https://www.anthropic.com/news/rss.xml' },
  { name: 'Google AI Blog', url: 'https://ai.googleblog.com/feeds/posts/default' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
];

// Fetch news from RSS feeds
async function fetchNewsFromRSS(limit: number = 5): Promise<any[]> {
  const articles: any[] = [];
  
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching from ${feed.name}...`);
      const parsed = await rssParser.parseURL(feed.url);
      
      for (const item of parsed.items.slice(0, 3)) {
        if (articles.length >= limit) break;
        
        const slug = slugify(item.title || 'untitled');
        
        // Check if already exists
        const existing = await prisma.news.findUnique({ where: { slug } });
        if (existing) {
          console.log(`  ⏭️ Skipping (exists): ${item.title}`);
          continue;
        }
        
        articles.push({
          title: item.title,
          slug,
          excerpt: item.contentSnippet?.substring(0, 200) || item.content?.substring(0, 200) || '',
          content: item['content:encoded'] || item.content || item.contentSnippet || '',
          originalUrl: item.link,
          source: feed.name,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        });
        
        console.log(`  ✅ Found: ${item.title}`);
      }
    } catch (error) {
      console.error(`  ❌ Error fetching ${feed.name}:`, error);
    }
  }
  
  return articles.slice(0, limit);
}

// Generate SEO meta information
function generateSEOMeta(article: any): {
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
} {
  // Meta title: 50-60 chars, include keywords
  const baseTitle = article.title;
  const metaTitle = baseTitle.length > 55 
    ? baseTitle.substring(0, 52) + '...'
    : baseTitle + ' | AI Explorer';
  
  // Meta description: 150-160 chars
  const excerpt = article.excerpt || '';
  const metaDescription = excerpt.length > 155
    ? excerpt.substring(0, 152) + '...'
    : excerpt + ' | Latest AI news and updates on AI Explorer.';
  
  return {
    metaTitle,
    metaDescription,
    ogImage: article.coverImage || undefined,
  };
}

// Review and save articles with SEO meta
async function reviewAndSaveArticles(articles: any[]) {
  console.log(`\n📋 Reviewing ${articles.length} articles...\n`);
  
  for (const article of articles) {
    const seo = generateSEOMeta(article);
    
    console.log('─'.repeat(60));
    console.log(`Title: ${article.title}`);
    console.log(`Source: ${article.source}`);
    console.log(`URL: ${article.originalUrl}`);
    console.log(`\nExcerpt: ${article.excerpt.substring(0, 150)}...`);
    console.log(`\n📝 Generated SEO Meta:`);
    console.log(`  Meta Title: ${seo.metaTitle}`);
    console.log(`  Meta Description: ${seo.metaDescription}`);
    console.log('─'.repeat(60));
    
    // Save to database with PENDING status
    const news = await prisma.news.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        originalUrl: article.originalUrl,
        source: article.source,
        publishedAt: article.publishedAt,
        status: 'REVIEWED',
        isPublished: false,
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        ogImage: seo.ogImage,
      },
    });
    
    console.log(`✅ Saved with ID: ${news.id}\n`);
  }
}

// Publish reviewed articles
async function publishArticles() {
  const reviewedArticles = await prisma.news.findMany({
    where: { status: 'REVIEWED', isPublished: false },
  });
  
  console.log(`\n📢 Publishing ${reviewedArticles.length} reviewed articles...\n`);
  
  for (const article of reviewedArticles) {
    await prisma.news.update({
      where: { id: article.id },
      data: {
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    
    console.log(`✅ Published: ${article.title}`);
    console.log(`   URL: /news/${article.slug}`);
    console.log(`   Meta: ${article.metaTitle}`);
  }
}

// Main workflow
async function main() {
  const command = process.argv[2];
  
  if (command === 'fetch') {
    console.log('🔍 Fetching news from RSS feeds...\n');
    const articles = await fetchNewsFromRSS(5);
    
    if (articles.length === 0) {
      console.log('No new articles found.');
      return;
    }
    
    await reviewAndSaveArticles(articles);
    console.log(`\n✨ Fetched and saved ${articles.length} articles for review.`);
    console.log('Run: npx tsx scripts/news-workflow.ts publish  to publish them.');
    
  } else if (command === 'publish') {
    await publishArticles();
    console.log('\n✨ All reviewed articles have been published.');
    
  } else if (command === 'list') {
    const pending = await prisma.news.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    const reviewed = await prisma.news.findMany({
      where: { status: 'REVIEWED', isPublished: false },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`\n📊 News Status:`);
    console.log(`  Pending: ${pending.length}`);
    console.log(`  Reviewed (ready to publish): ${reviewed.length}`);
    
    if (reviewed.length > 0) {
      console.log(`\nReady to publish:`);
      for (const article of reviewed) {
        console.log(`  - ${article.title}`);
      }
    }
    
  } else {
    console.log('Usage:');
    console.log('  npx tsx scripts/news-workflow.ts fetch    - Fetch news from RSS');
    console.log('  npx tsx scripts/news-workflow.ts publish  - Publish reviewed articles');
    console.log('  npx tsx scripts/news-workflow.ts list     - List pending/reviewed articles');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);

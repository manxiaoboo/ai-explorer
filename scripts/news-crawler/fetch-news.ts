/**
 * Fetch News
 * 
 * 从权威源抓取AI新闻
 * - 检查未审核阈值
 * - 抓取5条新闻
 * - AI分析内容
 * - 保存为PENDING状态
 */

import { prisma } from "./lib/db.js";
import * as xml2js from "xml2js";
import { extract } from "@extractus/article-extractor";

// 内容长度阈值 - 少于这个字符数会触发网页抓取
const CONTENT_MIN_LENGTH = 800;

const MAX_PENDING = parseInt(process.env.MAX_PENDING_NEWS || "10");
const DAILY_LIMIT = parseInt(process.env.DAILY_FETCH_LIMIT || "5");

// RSS 源配置
const RSS_SOURCES = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    weight: 10,
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    weight: 10,
  },
  {
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    weight: 10,
  },
  {
    name: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed/",
    weight: 8,
  },
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
    weight: 10,
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss",
    weight: 10,
  },
  {
    name: "Ars Technica AI",
    url: "https://arstechnica.com/tag/artificial-intelligence/feed/",
    weight: 8,
  },
  {
    name: "Synced Review",
    url: "https://syncedreview.com/feed/",
    weight: 7,
  },
];

interface NewsItem {
  title: string;
  link: string;
  pubDate: Date;
  content?: string;
  excerpt?: string;
  source: string;
  coverImage?: string;
}

/**
 * 检查未审核新闻数量
 */
async function checkPendingThreshold(): Promise<boolean> {
  const pendingCount = await prisma.news.count({
    where: { status: "PENDING" },
  });
  
  console.log(`📊 Current pending news: ${pendingCount}/${MAX_PENDING}`);
  
  if (pendingCount >= MAX_PENDING) {
    console.log("\n⚠️  PENDING NEWS THRESHOLD REACHED!");
    console.log(`   Current: ${pendingCount}, Max: ${MAX_PENDING}`);
    console.log("\n⛔ STOPPING: Please review pending news first.");
    console.log("\nTo view pending news:");
    console.log("  npx tsx scripts/news-crawler/list-pending.ts");
    console.log("\nTo approve a news item:");
    console.log("  npx tsx scripts/news-crawler/approve-news.ts [slug]");
    return false;
  }
  
  const canFetch = Math.min(DAILY_LIMIT, MAX_PENDING - pendingCount);
  console.log(`✅ Can fetch ${canFetch} news today\n`);
  
  return canFetch > 0;
}

/**
 * 抓取RSS feed
 */
async function fetchRSS(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AtooliBot/1.0)",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const xml = await response.text();
    const parser = new xml2js.Parser();
    return await parser.parseStringPromise(xml);
  } catch (error) {
    console.error(`  ❌ Failed to fetch ${url}:`, error);
    return null;
  }
}

/**
 * 解析RSS条目
 */
function parseRSSItems(feed: any, sourceName: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  try {
    const entries = feed.rss?.channel?.[0]?.item || 
                   feed.feed?.entry || [];
    
    for (const entry of entries.slice(0, 3)) { // 每个源取前3条
      // 处理 title（可能是字符串或对象）
      let title = entry.title?.[0] || entry.title;
      if (typeof title === 'object' && title !== null) {
        title = title._ || title;
      }
      
      // 处理 link（RSS vs Atom 格式）
      let link = entry.link?.[0]?.$?.href || 
                 entry.link?.[0] || 
                 entry.id?.[0];
      if (typeof link === 'object' && link !== null) {
        link = link._ || link.href || link;
      }
      
      const pubDate = new Date(entry.pubDate?.[0] || entry.updated?.[0] || Date.now());
      
      // 处理 content
      let content = entry["content:encoded"]?.[0] || 
                    entry.content?.[0]?._ || 
                    entry.content?.[0] ||
                    entry.summary?.[0]?._ ||
                    entry.summary?.[0] ||
                    entry.description?.[0];
      
      // 提取封面图
      let coverImage = null;
      const mediaContent = entry["media:content"]?.[0]?.$?.url;
      const enclosure = entry.enclosure?.[0]?.$?.url;
      if (mediaContent) coverImage = mediaContent;
      if (enclosure) coverImage = enclosure;
      
      if (title && link) {
        items.push({
          title: title.toString().trim(),
          link: link.toString(),
          pubDate,
          content: content?.toString(),
          source: sourceName,
          coverImage,
        });
      }
    }
  } catch (error) {
    console.error(`  ❌ Failed to parse ${sourceName}:`, error);
  }
  
  return items;
}

/**
 * 生成slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80) + "-" + Date.now().toString(36);
}

/**
 * 生成excerpt
 */
function generateExcerpt(content: string): string {
  // 移除HTML标签
  const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.slice(0, 200) + (text.length > 200 ? "..." : "");
}

/**
 * 检查新闻是否已存在
 */
async function isDuplicate(link: string, title: string): Promise<boolean> {
  const existing = await prisma.news.findFirst({
    where: {
      OR: [
        { originalUrl: link },
        { title: { equals: title, mode: "insensitive" } },
      ],
    },
  });
  return !!existing;
}

/**
 * 从网页提取完整内容（当RSS内容过短时）
 */
async function enrichContent(item: NewsItem): Promise<NewsItem> {
  const contentLength = item.content?.length || 0;
  
  // 如果内容足够长，直接返回
  if (contentLength >= CONTENT_MIN_LENGTH) {
    return item;
  }
  
  console.log(`  🌐 Fetching full content from: ${item.link.slice(0, 60)}...`);
  
  try {
    const article = await extract(item.link, {
      descriptionTruncateLen: 300,
      contentLengthThreshold: 200,
    });
    
    if (article && article.content && article.content.length > contentLength) {
      console.log(`     ✓ Enriched: ${contentLength} → ${article.content.length} chars`);
      return {
        ...item,
        content: article.content,
        excerpt: article.description || item.excerpt,
        coverImage: article.image || item.coverImage,
      };
    } else {
      console.log(`     ⚠️ Could not extract better content, using RSS version`);
    }
  } catch (error) {
    console.log(`     ⚠️ Extraction failed: ${(error as Error).message}`);
  }
  
  return item;
}

/**
 * 保存新闻到数据库
 */
async function saveNews(item: NewsItem): Promise<boolean> {
  try {
    // 检查重复
    if (await isDuplicate(item.link, item.title)) {
      console.log(`  ⚠️  Duplicate: ${item.title.slice(0, 50)}...`);
      return false;
    }
    
    // 增强内容（从网页抓取完整内容）
    item = await enrichContent(item);
    
    const slug = generateSlug(item.title);
    const excerpt = item.excerpt || generateExcerpt(item.content || item.title);
    
    // 清理内容为Markdown
    const content = item.content
      ? item.content
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]*>/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim()
      : excerpt;
    
    await prisma.news.create({
      data: {
        slug,
        title: item.title,
        excerpt,
        content,
        contentHtml: item.content,
        originalUrl: item.link,
        source: item.source,
        coverImage: item.coverImage,
        status: "PENDING",
        isPublished: false,
        aiAnalysis: {
          whyItMatters: "待分析",
          keyPoints: [],
          impact: "medium",
        },
      },
    });
    
    console.log(`  ✅ Saved: ${item.title.slice(0, 60)}...`);
    console.log(`     Slug: ${slug}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to save:`, error);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("🚀 AI News Fetcher\n");
  console.log("=".repeat(60));
  console.log(`Configuration:`);
  console.log(`  MAX_PENDING: ${MAX_PENDING}`);
  console.log(`  DAILY_LIMIT: ${DAILY_LIMIT}`);
  console.log(`  RSS Sources: ${RSS_SOURCES.length}`);
  console.log("=".repeat(60) + "\n");
  
  // 检查阈值
  const canProceed = await checkPendingThreshold();
  if (!canProceed) {
    process.exit(1);
  }
  
  // 计算可抓取数量
  const pendingCount = await prisma.news.count({
    where: { status: "PENDING" },
  });
  const fetchCount = Math.min(DAILY_LIMIT, MAX_PENDING - pendingCount);
  
  console.log(`📡 Fetching news from ${RSS_SOURCES.length} sources...\n`);
  
  const allItems: NewsItem[] = [];
  
  // 从各源抓取
  for (const source of RSS_SOURCES) {
    process.stdout.write(`🔍 ${source.name}... `);
    
    const feed = await fetchRSS(source.url);
    if (feed) {
      const items = parseRSSItems(feed, source.name);
      allItems.push(...items);
      console.log(`${items.length} items`);
    }
  }
  
  console.log(`\n📦 Total fetched: ${allItems.length} items`);
  
  // 按时间排序，取最新的
  allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  
  // 保存到数据库
  console.log(`\n💾 Saving up to ${fetchCount} news items...\n`);
  
  let saved = 0;
  for (const item of allItems) {
    if (saved >= fetchCount) break;
    
    // 只取最近7天的新闻
    const daysOld = (Date.now() - item.pubDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld > 7) continue;
    
    const success = await saveNews(item);
    if (success) saved++;
  }
  
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Done! Saved ${saved} new articles.`);
  console.log(`📋 Pending for review: ${pendingCount + saved}`);
  console.log("\nTo review:");
  console.log("  npx tsx scripts/news-crawler/list-pending.ts");
  console.log("=".repeat(60));
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

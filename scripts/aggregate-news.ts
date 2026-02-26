/**
 * AI News Aggregator & Curator
 * Automated content aggregation with tool linking
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Content sources to monitor
const CONTENT_SOURCES = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog',
    type: 'rss',
    category: 'AI Research'
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news',
    type: 'rss', 
    category: 'AI Research'
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    type: 'rss',
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

// AI-powered content analysis
async function analyzeWithAI(article: RawArticle): Promise<any> {
  const prompt = `Analyze this tech article:

Title: ${article.title}
Content: ${article.content.substring(0, 3000)}

Provide JSON:
{
  "summary": "2-sentence summary",
  "keyPoints": ["point1", "point2", "point3"],
  "relevanceScore": 85,
  "qualityScore": 78
}`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    return null;
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
    // Escape special regex characters
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

// Process articles
async function aggregateNews() {
  console.log('🔄 Starting news aggregation...\n');
  
  let totalFound = 0;
  let totalSaved = 0;
  
  for (const source of CONTENT_SOURCES) {
    console.log(`📡 Fetching from ${source.name}...`);
    const articles = await fetchRSSFeed(source);
    console.log(`  Found ${articles.length} articles`);
    
    for (const article of articles.slice(0, 5)) {
      if (await isDuplicate(article.url, article.title)) {
        console.log(`  ⏭️ Duplicate: ${article.title.substring(0, 50)}...`);
        continue;
      }
      
      const aiAnalysis = await analyzeWithAI(article);
      if (!aiAnalysis || aiAnalysis.qualityScore < 60) {
        console.log(`  ⏭️ Low quality: ${article.title.substring(0, 50)}...`);
        continue;
      }
      
      const mentionedTools = await findMentionedTools(article.content, article.title);
      
      // Create curated content
      const curatedContent = `## Summary
${aiAnalysis.summary}

## Key Points
${aiAnalysis.keyPoints.map((p: string) => `- ${p}`).join('\n')}

## Original Article
Read the full article at [${article.source}](${article.url}).

---
*This is a curated summary by Atooli. All content belongs to the original author.*`;

      const news = await prisma.news.create({
        data: {
          slug: generateSlug(article.title),
          title: article.title,
          excerpt: aiAnalysis.summary,
          content: curatedContent,
          originalUrl: article.url,
          source: article.source,
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
      console.log(`  ✅ Saved: ${article.title.substring(0, 60)}...`);
      if (mentionedTools.length > 0) {
        console.log(`     🔗 Linked: ${mentionedTools.map(t => t.toolName).join(', ')}`);
      }
    }
    
    totalFound += articles.length;
  }
  
  console.log(`\n📊 Summary: ${totalFound} found, ${totalSaved} saved for review`);
  await prisma.$disconnect();
}

aggregateNews().catch(console.error);

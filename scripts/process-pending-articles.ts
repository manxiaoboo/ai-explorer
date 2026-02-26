/**
 * Process Pending Articles with AI Analysis
 * Run this after aggregate-news.ts to generate curated content
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PendingArticle {
  slug: string;
  title: string;
  originalUrl: string;
  source: string;
  author?: string;
  publishedAt: string;
  content: string;
  mentionedTools: Array<{
    toolId: string;
    toolName: string;
    mentions: number;
  }>;
  fetchedAt: string;
  status: string;
}

// AI analysis - placeholder for manual implementation
async function analyzeWithAI(article: PendingArticle): Promise<{
  summary: string;
  keyPoints: string[];
  relevanceScore: number;
  qualityScore: number;
} | null> {
  // This function should be called by the user manually
  // For now, return null to indicate manual review needed
  console.log(`\n🤖 AI Analysis needed for: ${article.title}`);
  console.log(`   Original: ${article.originalUrl}`);
  console.log(`   Content preview: ${article.content.substring(0, 200)}...`);
  console.log('');
  
  // In actual implementation, this would call your preferred AI service
  // For now, we'll create a template for manual review
  return null;
}

// Create curated content from AI analysis
function createCuratedContent(article: PendingArticle, analysis: {
  summary: string;
  keyPoints: string[];
}): string {
  return `## Summary
${analysis.summary}

## Key Points
${analysis.keyPoints.map(p => `- ${p}`).join('\n')}

## Original Article
Read the full article at [${article.source}](${article.originalUrl}).

---
*This is a curated summary by Atooli. All content belongs to the original author.*`;
}

// Process a single pending article
async function processPendingArticle(filePath: string) {
  const data: PendingArticle = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  console.log(`\n📄 Processing: ${data.title}`);
  console.log(`   Source: ${data.source}`);
  console.log(`   URL: ${data.originalUrl}`);
  
  if (data.mentionedTools.length > 0) {
    console.log(`   Tools mentioned: ${data.mentionedTools.map(t => t.toolName).join(', ')}`);
  }
  
  // Check if already processed
  const existing = await prisma.news.findUnique({
    where: { slug: data.slug }
  });
  
  if (existing) {
    console.log(`   ⏭️ Already exists in database`);
    fs.unlinkSync(filePath);
    return;
  }
  
  // For manual workflow: Create template for AI analysis
  const template = {
    ...data,
    aiAnalysis: {
      summary: "[AI生成的2句话摘要]",
      keyPoints: [
        "[要点1]",
        "[要点2]", 
        "[要点3]"
      ],
      relevanceScore: 85,
      qualityScore: 78
    }
  };
  
  // Save template for manual editing
  fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
  
  console.log(`   📝 Template saved. Please edit the aiAnalysis field.`);
  console.log(`   File: ${filePath}`);
}

// Process all pending articles
async function processAllPending() {
  const reviewDir = path.join(process.cwd(), 'pending-reviews');
  
  if (!fs.existsSync(reviewDir)) {
    console.log('No pending articles found.');
    return;
  }
  
  const files = fs.readdirSync(reviewDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('No pending articles to process.');
    return;
  }
  
  console.log(`Found ${files.length} pending articles:\n`);
  
  for (const file of files) {
    await processPendingArticle(path.join(reviewDir, file));
  }
  
  console.log('\n========================================');
  console.log('Next steps:');
  console.log('1. Edit the aiAnalysis field in each JSON file');
  console.log('2. Run: npx tsx scripts/publish-reviewed-articles.ts');
  console.log('========================================');
}

// Publish reviewed articles to database
async function publishReviewedArticles() {
  const reviewDir = path.join(process.cwd(), 'pending-reviews');
  
  if (!fs.existsSync(reviewDir)) {
    console.log('No pending articles found.');
    return;
  }
  
  const files = fs.readdirSync(reviewDir).filter(f => f.endsWith('.json'));
  let published = 0;
  
  for (const file of files) {
    const filePath = path.join(reviewDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Check if AI analysis is complete
    if (!data.aiAnalysis?.summary || data.aiAnalysis.summary.includes('[')) {
      console.log(`⏭️ Skipping (not reviewed): ${data.title}`);
      continue;
    }
    
    // Create curated content
    const curatedContent = createCuratedContent(data, data.aiAnalysis);
    
    // Save to database
    const news = await prisma.news.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.aiAnalysis.summary,
        content: curatedContent,
        originalUrl: data.originalUrl,
        source: data.source,
        isPublished: false, // Still needs final approval
        publishedAt: new Date(data.publishedAt)
      }
    });
    
    // Store tool mentions
    for (const mention of data.mentionedTools) {
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
    
    // Remove processed file
    fs.unlinkSync(filePath);
    
    published++;
    console.log(`✅ Published: ${data.title}`);
  }
  
  console.log(`\n📊 Published ${published} articles`);
  await prisma.$disconnect();
}

// Main
const command = process.argv[2];

if (command === 'publish') {
  publishReviewedArticles().catch(console.error);
} else {
  processAllPending().catch(console.error);
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json();
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name required' }, { status: 400 });
    }
    
    const filePath = path.join(process.cwd(), 'pending-reviews', fileName);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Check if AI analysis is complete
    const hasAIAnalysis = data.aiAnalysis?.summary && !data.aiAnalysis.summary.includes('[');
    
    // Create curated content
    let curatedContent: string;
    let excerpt: string;
    
    if (hasAIAnalysis) {
      // Use AI-generated summary
      curatedContent = `## Summary
${data.aiAnalysis.summary}

## Key Points
${data.aiAnalysis.keyPoints.map((p: string) => `- ${p}`).join('\n')}

## Original Article
Read the full article at [${data.source}](${data.originalUrl}).

---
*This is a curated summary by Atooli. All content belongs to the original author.*`;
      excerpt = data.aiAnalysis.summary;
    } else {
      // Use original content with note
      curatedContent = `## Original Article
${data.content}

---
*Source: [${data.source}](${data.originalUrl})*
*This article is shared from ${data.source}. All content belongs to the original author.*`;
      excerpt = data.content.substring(0, 200) + '...';
    }
    
    // Save to database
    const news = await prisma.news.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: excerpt,
        content: curatedContent,
        originalUrl: data.originalUrl,
        source: data.source,
        isPublished: true,
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
    
    // Delete the pending file
    fs.unlinkSync(filePath);
    
    return NextResponse.json({ success: true, newsId: news.id });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
  }
}

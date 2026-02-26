import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, NewsStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { newsId } = await request.json();
    
    if (!newsId) {
      return NextResponse.json({ error: 'News ID required' }, { status: 400 });
    }
    
    // Get the news article
    const news = await prisma.news.findUnique({
      where: { id: newsId }
    });
    
    if (!news) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Update to published status
    await prisma.news.update({
      where: { id: newsId },
      data: {
        status: NewsStatus.PUBLISHED,
        isPublished: true,
        publishedAt: new Date()
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
  }
}

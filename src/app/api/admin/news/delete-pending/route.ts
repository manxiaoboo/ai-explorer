import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, NewsStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { newsId } = await request.json();
    
    if (!newsId) {
      return NextResponse.json({ error: 'News ID required' }, { status: 400 });
    }
    
    // Delete the news article
    await prisma.news.delete({
      where: { id: newsId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

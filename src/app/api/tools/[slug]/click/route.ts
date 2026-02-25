/**
 * Click tracking API route
 * POST /api/tools/[slug]/click
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createHash } from 'crypto';

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Find tool
    const tool = await prisma.tool.findUnique({
      where: { slug }
    });
    
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    // Get client info
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const ipHash = hashIP(ip);
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    
    // Record click
    await prisma.toolClick.create({
      data: {
        toolId: tool.id,
        ipHash,
        userAgent: userAgent.substring(0, 255),
        referrer: referrer.substring(0, 255),
      }
    });
    
    // Update total click count
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        clickCount: { increment: 1 }
      }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

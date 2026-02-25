/**
 * Save/favorite API route
 * POST /api/tools/[slug]/save
 * DELETE /api/tools/[slug]/save
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
    
    const tool = await prisma.tool.findUnique({
      where: { slug }
    });
    
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const ipHash = hashIP(ip);
    
    // Try to create save (will fail if already exists due to unique constraint)
    try {
      await prisma.toolSave.create({
        data: {
          toolId: tool.id,
          ipHash,
        }
      });
      
      // Increment save count
      await prisma.tool.update({
        where: { id: tool.id },
        data: {
          saveCount: { increment: 1 }
        }
      });
      
      return NextResponse.json({ saved: true });
      
    } catch (e: any) {
      // Unique constraint violation - already saved
      if (e.code === 'P2002') {
        return NextResponse.json({ saved: true, alreadySaved: true });
      }
      throw e;
    }
    
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const tool = await prisma.tool.findUnique({
      where: { slug }
    });
    
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const ipHash = hashIP(ip);
    
    // Delete save
    await prisma.toolSave.deleteMany({
      where: {
        toolId: tool.id,
        ipHash,
      }
    });
    
    // Decrement save count
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        saveCount: { decrement: 1 }
      }
    });
    
    return NextResponse.json({ saved: false });
    
  } catch (error) {
    console.error('Unsave error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

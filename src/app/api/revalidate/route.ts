import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Cache revalidation API
 * 
 * Usage:
 * POST /api/revalidate?path=/tools&secret=your-secret
 * POST /api/revalidate?tag=tools&secret=your-secret
 * 
 * Environment variable: REVALIDATE_SECRET
 */

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const requestSecret = request.nextUrl.searchParams.get('secret');
  
  // Validate secret
  if (!secret || requestSecret !== secret) {
    return NextResponse.json(
      { error: 'Invalid secret' },
      { status: 401 }
    );
  }
  
  const path = request.nextUrl.searchParams.get('path');
  const tag = request.nextUrl.searchParams.get('tag');
  
  try {
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ 
        revalidated: true, 
        path,
        message: `Path ${path} revalidated successfully` 
      });
    }
    
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ 
        revalidated: true, 
        tag,
        message: `Tag ${tag} revalidated successfully` 
      });
    }
    
    // Revalidate common paths if no specific path/tag provided
    const paths = ['/', '/tools', '/trending'];
    paths.forEach(p => revalidatePath(p));
    
    return NextResponse.json({ 
      revalidated: true, 
      paths,
      message: 'Common paths revalidated successfully' 
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate', details: String(error) },
      { status: 500 }
    );
  }
}

// Also support GET for simple testing (without secret check in dev)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return POST(request);
  }
  
  return NextResponse.json(
    { error: 'Use POST method' },
    { status: 405 }
  );
}

import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy images from Vercel Blob
 * This allows private blobs to be served while controlling access
 * 
 * GET /api/image?path=logos/xxx.png
 */

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  
  if (!path) {
    return NextResponse.json({ error: 'No path provided' }, { status: 400 });
  }
  
  // Security: only allow specific paths
  if (!path.startsWith('logos/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }
  
  try {
    // Get the blob with a signed URL
    const blobResult = await get(path, {
      access: 'private',
    });
    
    if (!blobResult) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Handle different response types
    if ('url' in blobResult && typeof blobResult.url === 'string') {
      // Redirect to the signed URL (valid for a few minutes)
      return NextResponse.redirect(blobResult.url);
    } else if ('stream' in blobResult) {
      // Stream the blob directly
      const headers = new Headers();
      blobResult.headers.forEach((value, key) => {
        headers.set(key, value);
      });
      return new NextResponse(blobResult.stream, { headers });
    }
    
    return NextResponse.json({ error: 'Unexpected blob response' }, { status: 500 });
    
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}

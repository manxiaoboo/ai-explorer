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
    
    // Handle signed URL response (preferred method)
    if ('url' in blobResult && typeof blobResult.url === 'string') {
      // Fetch the image from the signed URL and proxy it
      // This avoids CORS issues and gives us control over caching
      const imageResponse = await fetch(blobResult.url);
      
      if (!imageResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
      }
      
      // Get the image data
      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      
      // Return with proper headers
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          'Vary': 'Accept',
        },
      });
    }
    
    // Fallback: stream response
    if ('stream' in blobResult) {
      const headers: Record<string, string> = {};
      
      // Copy headers safely
      blobResult.headers.forEach((value, key) => {
        // Skip problematic headers
        if (key.toLowerCase() !== 'content-encoding' && 
            key.toLowerCase() !== 'transfer-encoding') {
          headers[key] = value;
        }
      });
      
      // Ensure Content-Type is set
      if (!headers['content-type']) {
        headers['content-type'] = 'image/png';
      }
      
      // Add cache headers
      headers['cache-control'] = 'public, max-age=3600, s-maxage=86400';
      
      return new NextResponse(blobResult.stream, { 
        status: 200,
        headers 
      });
    }
    
    return NextResponse.json({ error: 'Unexpected blob response' }, { status: 500 });
    
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}

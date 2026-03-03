import { put, del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Upload image to Vercel Blob
 * POST /api/upload-image
 * Body: FormData with 'file' field
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 400 });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = `${folder}/${timestamp}-${random}.${extension}`;
    
    // Upload to Vercel Blob (use private access for private stores)
    const blob = await put(filename, file, {
      access: 'private',
      addRandomSuffix: false,
    });
    
    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Delete image from Vercel Blob
 * DELETE /api/upload-image?url=https://...
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }
    
    await del(url);
    
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed', details: String(error) },
      { status: 500 }
    );
  }
}

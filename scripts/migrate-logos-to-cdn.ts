/**
 * Migrate existing logos to Vercel Blob
 * Run: npx tsx scripts/migrate-logos-to-cdn.ts
 */

import { put, list } from '@vercel/blob';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const LOGOS_DIR = './public/logos';

async function migrateLogos() {
  console.log('🚀 Starting logo migration to Vercel Blob...\n');
  
  // Check if BLOB_READ_WRITE_TOKEN is set
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN is not set');
    console.log('   Get it from: https://vercel.com/dashboard/stores');
    process.exit(1);
  }
  
  try {
    // List existing files in blob storage
    console.log('📋 Checking existing blobs...');
    const existingBlobs = await list({ prefix: 'logos/' });
    const existingUrls = new Set(existingBlobs.blobs.map(b => b.pathname));
    
    // Read local logos
    const files = await readdir(LOGOS_DIR);
    const imageFiles = files.filter(f => /\.(png|jpg|jpeg|svg)$/i.test(f));
    
    console.log(`📁 Found ${imageFiles.length} local logos\n`);
    
    const results = {
      uploaded: 0,
      skipped: 0,
      failed: 0,
    };
    
    for (const filename of imageFiles) {
      const blobPath = `logos/${filename}`;
      
      // Skip if already exists
      if (existingUrls.has(blobPath)) {
        console.log(`⏭️  Skipped (exists): ${filename}`);
        results.skipped++;
        continue;
      }
      
      try {
        const filepath = join(LOGOS_DIR, filename);
        const buffer = await readFile(filepath);
        
        // Detect content type
        const ext = filename.split('.').pop()?.toLowerCase();
        const contentType = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          svg: 'image/svg+xml',
        }[ext as string] || 'application/octet-stream';
        
        // Upload to Vercel Blob (use private access for private stores)
        const blob = await put(blobPath, buffer, {
          access: 'private',
          contentType,
          addRandomSuffix: false,
        });
        
        console.log(`✅ Uploaded: ${filename} -> ${blob.url}`);
        results.uploaded++;
        
      } catch (error) {
        console.error(`❌ Failed: ${filename}`, error);
        results.failed++;
      }
    }
    
    console.log('\n========================================');
    console.log('📊 Migration Summary');
    console.log('========================================');
    console.log(`✅ Uploaded: ${results.uploaded}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`❌ Failed:   ${results.failed}`);
    console.log('========================================\n');
    
    if (results.uploaded > 0) {
      console.log('📝 Next steps:');
      console.log('   1. Update database logo URLs to use CDN');
      console.log('   2. Test image loading on your site');
      console.log('   3. Remove local files after verification\n');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateLogos();

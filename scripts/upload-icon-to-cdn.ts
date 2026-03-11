import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { join } from 'path';

async function uploadIcon() {
  const publicDir = join(process.cwd(), 'public');
  
  // Read token from environment
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment');
    process.exit(1);
  }
  
  const files = [
    { path: join(publicDir, 'favicon.svg'), name: 'brand/favicon.svg', contentType: 'image/svg+xml' },
    { path: join(publicDir, 'icon.svg'), name: 'brand/icon.svg', contentType: 'image/svg+xml' },
    { path: join(publicDir, 'favicon-32x32.png'), name: 'brand/favicon-32x32.png', contentType: 'image/png' },
    { path: join(publicDir, 'apple-touch-icon.png'), name: 'brand/apple-touch-icon.png', contentType: 'image/png' },
    { path: join(publicDir, 'icon-192x192.png'), name: 'brand/icon-192x192.png', contentType: 'image/png' },
    { path: join(publicDir, 'icon-512x512.png'), name: 'brand/icon-512x512.png', contentType: 'image/png' },
  ];

  console.log('🎨 Uploading Atooli brand assets to CDN...\n');

  for (const file of files) {
    try {
      const content = readFileSync(file.path);
      const blob = await put(file.name, content, {
        access: 'private',
        contentType: file.contentType,
        token,
      });
      console.log(`✅ ${file.name}`);
      console.log(`   ${blob.url}\n`);
    } catch (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error);
    }
  }

  console.log('\n🎉 All brand assets uploaded successfully!');
  console.log('\n📋 Usage in your app:');
  console.log(`   <link rel="icon" type="image/svg+xml" href="CDN_URL/favicon.svg" />`);
  console.log(`   <link rel="apple-touch-icon" sizes="180x180" href="CDN_URL/apple-touch-icon.png" />`);
  console.log(`   <link rel="icon" type="image/png" sizes="32x32" href="CDN_URL/favicon-32x32.png" />`);
}

uploadIcon().catch(console.error);

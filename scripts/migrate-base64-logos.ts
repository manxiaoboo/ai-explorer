/**
 * Migrate base64/SVG logos to Vercel Blob CDN
 * Run: BLOB_READ_WRITE_TOKEN=xxx npx tsx scripts/migrate-base64-logos.ts
 */

import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// Map to store base64 -> CDN URL mappings
const uploadedLogos = new Map<string, string>();

async function migrateBase64Logos() {
  console.log('🚀 Starting base64 logo migration to Vercel Blob...\n');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN is not set');
    process.exit(1);
  }
  
  try {
    // Get all tools with base64 logos
    const tools = await prisma.tool.findMany({
      where: { 
        logo: { 
          startsWith: 'data:' 
        } 
      },
      select: { id: true, name: true, logo: true },
    });
    
    console.log(`📊 Found ${tools.length} tools with base64 logos\n`);
    
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const tool of tools) {
      if (!tool.logo) continue;
      
      // Check if already uploaded this exact logo
      let cdnUrl = uploadedLogos.get(tool.logo);
      
      if (!cdnUrl) {
        // Upload to Vercel Blob
        try {
          // Parse data URL
          const match = tool.logo.match(/^data:([^;]+);base64,(.+)$/);
          if (!match) {
            console.log(`⏭️  Not a valid data URL: ${tool.name}`);
            skipped++;
            continue;
          }
          
          const [, mimeType, base64Data] = match;
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Generate filename from content hash
          const hash = createHash('md5').update(buffer).digest('hex').substring(0, 12);
          const ext = mimeType === 'image/svg+xml' ? 'svg' : 'png';
          const filename = `logos/generated/${hash}.${ext}`;
          
          console.log(`📤 Uploading: ${tool.name} (${filename})`);
          
          const blob = await put(filename, buffer, {
            access: 'private',
            contentType: mimeType,
            addRandomSuffix: false,
            allowOverwrite: true, // Allow overwrite for duplicate logos
          });
          
          cdnUrl = blob.url;
          uploadedLogos.set(tool.logo, cdnUrl);
          console.log(`✅ Uploaded: ${tool.name}`);
          
        } catch (error) {
          console.error(`❌ Failed to upload ${tool.name}:`, error);
          failed++;
          continue;
        }
      } else {
        console.log(`♻️  Using cached: ${tool.name}`);
      }
      
      // Update database
      try {
        await prisma.tool.update({
          where: { id: tool.id },
          data: { logo: cdnUrl },
        });
        console.log(`✅ Updated DB: ${tool.name}`);
        updated++;
      } catch (error) {
        console.error(`❌ Failed to update DB for ${tool.name}:`, error);
        failed++;
      }
    }
    
    console.log('\n========================================');
    console.log('📊 Migration Summary');
    console.log('========================================');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed:   ${failed}`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateBase64Logos();

/**
 * Update database logo URLs to use Vercel Blob CDN
 * Run: npx tsx scripts/update-db-logos.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of local filenames to CDN URLs
const logoMapping: Record<string, string> = {
  '098f2c412563.png': 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/098f2c412563.png',
  'a964e7e2c2c4.png': 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/a964e7e2c2c4.png',
  'c53b7b9e56b3.png': 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/c53b7b9e56b3.png',
  'd7a27f2a25f1.png': 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/d7a27f2a25f1.png',
  'f5fee92a789f.png': 'https://gyqld3z17j5o0ygm.private.blob.vercel-storage.com/logos/f5fee92a789f.png',
};

async function updateDbLogos() {
  console.log('🔄 Updating database logo URLs to CDN...\n');
  
  try {
    // Get all tools with logos
    const tools = await prisma.tool.findMany({
      where: { logo: { not: null } },
      select: { id: true, name: true, logo: true },
    });
    
    console.log(`📊 Found ${tools.length} tools with logos\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const tool of tools) {
      if (!tool.logo) continue;
      
      // Extract filename from logo path
      const filename = tool.logo.split('/').pop();
      if (!filename) continue;
      
      // Check if we have a CDN mapping for this file
      const cdnUrl = logoMapping[filename];
      if (!cdnUrl) {
        console.log(`⏭️  No CDN mapping: ${tool.name} (${filename})`);
        skipped++;
        continue;
      }
      
      // Skip if already using CDN
      if (tool.logo.startsWith('http')) {
        console.log(`⏭️  Already CDN: ${tool.name}`);
        skipped++;
        continue;
      }
      
      // Update database
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: cdnUrl },
      });
      
      console.log(`✅ Updated: ${tool.name} -> ${cdnUrl}`);
      updated++;
    }
    
    console.log('\n========================================');
    console.log('📊 Database Update Summary');
    console.log('========================================');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateDbLogos();

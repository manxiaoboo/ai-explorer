/**
 * Fix broken logo for XTTS - re-upload and update
 */

import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate a simple XTTS logo SVG
const xttsLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#10b981"/>
  <text x="50" y="65" font-size="45" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="bold">X</text>
</svg>`;

async function fixXTTSLogo() {
  console.log('🔧 Fixing XTTS logo...\n');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN is not set');
    process.exit(1);
  }
  
  try {
    // Find XTTS tool
    const tool = await prisma.tool.findFirst({
      where: { name: { contains: 'XTTS', mode: 'insensitive' } },
    });
    
    if (!tool) {
      console.log('❌ XTTS tool not found');
      return;
    }
    
    console.log(`Found: ${tool.name}`);
    console.log(`Current logo: ${tool.logo || 'null'}\n`);
    
    // Upload new logo
    const buffer = Buffer.from(xttsLogoSvg);
    const filename = `logos/generated/xtts-fixed-${Date.now()}.svg`;
    
    console.log(`📤 Uploading new logo...`);
    const blob = await put(filename, buffer, {
      access: 'private',
      contentType: 'image/svg+xml',
      addRandomSuffix: false,
    });
    
    console.log(`✅ Uploaded: ${blob.url}\n`);
    
    // Update database
    await prisma.tool.update({
      where: { id: tool.id },
      data: { logo: blob.url },
    });
    
    console.log(`✅ Database updated!`);
    console.log(`New logo URL: ${blob.url}`);
    
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixXTTSLogo();

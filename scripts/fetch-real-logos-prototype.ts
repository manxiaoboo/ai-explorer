/**
 * Fetch real logos from the web and upload to Vercel Blob
 * This is a prototype for a few tools to verify the workflow
 */

import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Known logo URLs for popular tools (to avoid searching)
const knownLogos: Record<string, string> = {
  'ChatGPT': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
  'Claude': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Claude_AI_logo.png',
  'Google Gemini': 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Google_Gemini_logo.svg',
  'Midjourney': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Midjourney_Emblem.svg',
  'GitHub Copilot': 'https://github.githubassets.com/images/icons/copilot/copilot-128.png',
  'DALL-E': 'https://upload.wikimedia.org/wikipedia/commons/0/04/DALL-E_logo.png',
  'Stable Diffusion': 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Stable_Diffusion_logo.png',
  'Notion': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
  'Figma': 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
  'Canva': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_logo_2021.svg',
};

async function fetchAndUploadLogo(toolName: string, imageUrl: string): Promise<string | null> {
  try {
    console.log(`  Fetching: ${imageUrl}`);
    
    // Fetch image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.log(`  ❌ Failed to fetch: ${response.status}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Determine extension
    const ext = contentType.includes('svg') ? 'svg' : 
                contentType.includes('png') ? 'png' : 
                contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' : 'png';
    
    // Create filename
    const safeName = toolName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `logos/real/${safeName}-${Date.now()}.${ext}`;
    
    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'private',
      contentType,
      addRandomSuffix: false,
    });
    
    console.log(`  ✅ Uploaded: ${blob.url}`);
    return blob.url;
    
  } catch (error) {
    console.error(`  ❌ Error:`, error);
    return null;
  }
}

async function prototypeFetch() {
  console.log('🚀 Prototype: Fetching real logos...\n');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN not set');
    process.exit(1);
  }
  
  let success = 0;
  let failed = 0;
  
  for (const [toolName, imageUrl] of Object.entries(knownLogos).slice(0, 5)) {
    console.log(`\n📸 ${toolName}:`);
    
    const cdnUrl = await fetchAndUploadLogo(toolName, imageUrl);
    
    if (cdnUrl) {
      // Update database
      const tool = await prisma.tool.findFirst({
        where: { name: { contains: toolName, mode: 'insensitive' } },
      });
      
      if (tool) {
        await prisma.tool.update({
          where: { id: tool.id },
          data: { logo: cdnUrl },
        });
        console.log(`  ✅ Database updated`);
        success++;
      } else {
        console.log(`  ⚠️ Tool not found in database`);
        failed++;
      }
    } else {
      failed++;
    }
    
    // Small delay
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n========================================');
  console.log('📊 Prototype Results');
  console.log('========================================');
  console.log(`Success: ${success}`);
  console.log(`Failed:  ${failed}`);
  console.log('========================================\n');
  
  await prisma.$disconnect();
}

prototypeFetch();

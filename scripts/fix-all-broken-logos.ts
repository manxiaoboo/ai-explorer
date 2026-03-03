/**
 * Fix all broken logos by resetting tools with 403 blob URLs to null
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of known broken blob filenames (from 403 errors)
const brokenBlobs = [
  '6d802f68df0c.png',  // AionUi, System_prompts_leaks, Awesome Claude Skills, etc.
  'cf03539b9e75.png',  // Dreamina, etc.
  '9961773b5001.png',  // RagaAI Catalyst, etc.
  '25e535a2f18c.png',  // MOSS, etc.
  'a6e2666ca292.png',  // scite, etc.
  'ad77b94423f6.png',  // Akkio, etc.
  '3219dce44d84.png',  // LALAL.AI, etc.
  '66069d483643.png',  // AnalyticDB, etc.
  'cf404a6c1a35.png',  // Tableau AI, etc.
  'ca8f408d1c3c.png',  // Fathom, etc.
  'a2647a48073a.png',  // Otter.ai, etc.
  '65a34677d7cb.png',  // IOPaint, etc.
  'c49997bceb08.png',  // Datasets, etc.
  '0584fe19bacb.png',  // Motion, etc.
  '0387e092618e.png',  // WellSaid, etc.
  '6eb62aad6e29.png',  // Notion, etc.
  'da1870fa244e.png',  // Power BI, etc.
  '81b305a690da.png',  // RWKV, etc.
  'fea85ac3fc2a.png',  // Codeium, etc.
  '98405406dcfc.png',  // Trae, etc.
];

async function fixAllBrokenLogos() {
  console.log('🔧 Fixing all broken logos...\n');
  
  let fixed = 0;
  let skipped = 0;
  
  // Find all tools with broken blob URLs
  const tools = await prisma.tool.findMany({
    where: {
      logo: { contains: 'vercel-storage.com' }
    },
    select: { id: true, name: true, logo: true }
  });
  
  console.log(`Found ${tools.length} tools with Vercel Blob URLs\n`);
  
  for (const tool of tools) {
    if (!tool.logo) continue;
    
    // Check if this tool uses a known broken blob
    const isBroken = brokenBlobs.some(blob => tool.logo!.includes(blob));
    
    if (isBroken) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: null }
      });
      console.log(`✅ Fixed: ${tool.name}`);
      fixed++;
    } else {
      // Check if blob exists
      try {
        const response = await fetch(tool.logo, { method: 'HEAD' });
        if (response.status === 403) {
          await prisma.tool.update({
            where: { id: tool.id },
            data: { logo: null }
          });
          console.log(`✅ Fixed: ${tool.name} (403 error)`);
          fixed++;
        } else {
          skipped++;
        }
      } catch {
        await prisma.tool.update({
          where: { id: tool.id },
          data: { logo: null }
        });
        console.log(`✅ Fixed: ${tool.name} (fetch error)`);
        fixed++;
      }
      
      // Small delay
      await new Promise(r => setTimeout(r, 50));
    }
  }
  
  console.log('\n========================================');
  console.log('📊 Fix Results');
  console.log('========================================');
  console.log(`Fixed:   ${fixed}`);
  console.log(`Skipped: ${skipped}`);
  console.log('========================================\n');
  
  await prisma.$disconnect();
}

fixAllBrokenLogos();

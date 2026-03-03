/**
 * Fix broken logos for audio/video tools
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const brokenTools = [
  'Coqui TTS', 'CogVideo', 'GPT-SoVITS', 'Bark', 'StyleTTS 2',
  'Tortoise TTS', 'Automatic1111', 'Mochi Diffusion'
];

async function fixAudioVideoLogos() {
  console.log('🔧 Fixing audio/video tool logos...\n');
  
  let fixed = 0;
  let skipped = 0;
  
  for (const toolName of brokenTools) {
    try {
      const tool = await prisma.tool.findFirst({
        where: { name: { contains: toolName, mode: 'insensitive' } },
      });
      
      if (!tool) {
        console.log(`⏭️  Not found: ${toolName}`);
        skipped++;
        continue;
      }
      
      // Check if logo is broken (contains the bad blob URL)
      if (tool.logo?.includes('6d802f68df0c.png')) {
        // Set logo to null to trigger generated logo
        await prisma.tool.update({
          where: { id: tool.id },
          data: { logo: null },
        });
        console.log(`✅ Fixed: ${tool.name}`);
        fixed++;
      } else if (tool.logo?.includes('vercel-storage.com')) {
        // Check if this blob exists
        try {
          const response = await fetch(tool.logo, { method: 'HEAD' });
          if (response.status === 403) {
            await prisma.tool.update({
              where: { id: tool.id },
              data: { logo: null },
            });
            console.log(`✅ Fixed: ${tool.name} (403 error)`);
            fixed++;
          } else {
            console.log(`⏭️  OK: ${tool.name}`);
            skipped++;
          }
        } catch {
          await prisma.tool.update({
            where: { id: tool.id },
            data: { logo: null },
          });
          console.log(`✅ Fixed: ${tool.name} (fetch error)`);
          fixed++;
        }
      } else {
        console.log(`⏭️  OK: ${tool.name}`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Failed to fix ${toolName}:`, error);
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

fixAudioVideoLogos();

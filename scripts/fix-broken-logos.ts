/**
 * Fix broken logos by resetting to generated logos
 * This sets logo to null so the ToolLogo component will generate a default icon
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of tools with known broken logos
const brokenTools = [
  'ChatGPT', 'Claude', 'Google Gemini', 'Perplexity AI', 'Poe',
  'Midjourney', 'Stable Diffusion', 'DALL-E 3', 'Leonardo.ai', 'Ideogram',
  'GitHub Copilot', 'Cursor', 'Tabnine', 'Replit Ghostwriter',
  // Add more as needed
];

async function fixBrokenLogos() {
  console.log('🔧 Fixing broken logos...\n');
  
  let fixed = 0;
  let skipped = 0;
  
  for (const toolName of brokenTools) {
    try {
      const tool = await prisma.tool.findFirst({
        where: { name: toolName },
      });
      
      if (!tool) {
        console.log(`⏭️  Not found: ${toolName}`);
        skipped++;
        continue;
      }
      
      // Check if logo is broken (contains vercel-storage.com)
      if (tool.logo?.includes('vercel-storage.com')) {
        // Set logo to null to trigger generated logo
        await prisma.tool.update({
          where: { id: tool.id },
          data: { logo: null },
        });
        console.log(`✅ Fixed: ${toolName} (was: ${tool.logo?.substring(0, 50)}...)`);
        fixed++;
      } else {
        console.log(`⏭️  Already OK: ${toolName}`);
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

fixBrokenLogos();

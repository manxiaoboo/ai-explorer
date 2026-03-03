/**
 * Check for broken logos (403 errors)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBrokenLogos() {
  console.log('🔍 Checking for broken logos...\n');
  
  const tools = await prisma.tool.findMany({
    where: { 
      logo: { contains: 'vercel-storage.com' }
    },
    select: { name: true, logo: true },
    take: 50
  });
  
  let checked = 0;
  let broken = 0;
  
  for (const tool of tools) {
    if (!tool.logo) continue;
    
    try {
      const response = await fetch(tool.logo, { method: 'HEAD' });
      checked++;
      
      if (response.status === 403) {
        console.log(`❌ 403 Forbidden: ${tool.name}`);
        console.log(`   URL: ${tool.logo}`);
        broken++;
      } else if (response.status !== 200) {
        console.log(`⚠️  ${response.status}: ${tool.name}`);
        broken++;
      }
    } catch (error) {
      console.log(`❌ Error checking ${tool.name}: ${error}`);
      broken++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n========================================`);
  console.log(`📊 Check Results`);
  console.log(`========================================`);
  console.log(`Checked: ${checked}`);
  console.log(`Broken:  ${broken}`);
  console.log(`========================================\n`);
  
  await prisma.$disconnect();
}

checkBrokenLogos();

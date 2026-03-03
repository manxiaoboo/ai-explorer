import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findBrokenLogos() {
  console.log('🔍 Finding broken logos by blob URL pattern...\n');
  
  // Get all tools with vercel-storage URLs
  const tools = await prisma.tool.findMany({
    where: { 
      logo: { contains: 'vercel-storage.com' }
    },
    select: { name: true, logo: true }
  });
  
  // Group by blob filename
  const blobGroups = new Map<string, string[]>();
  
  for (const tool of tools) {
    if (!tool.logo) continue;
    
    // Extract filename from URL
    const match = tool.logo.match(/\/([^\/]+\.png|[^\/]+\.svg)$/);
    if (match) {
      const filename = match[1];
      if (!blobGroups.has(filename)) {
        blobGroups.set(filename, []);
      }
      blobGroups.get(filename)!.push(tool.name);
    }
  }
  
  // Sort by count (most shared blobs first)
  const sorted = Array.from(blobGroups.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  console.log('Blob URL usage (top 20):\n');
  for (const [filename, names] of sorted.slice(0, 20)) {
    console.log(`${filename}: ${names.length} tools`);
    if (names.length <= 5) {
      names.forEach(n => console.log(`  - ${n}`));
    } else {
      console.log(`  - ${names.slice(0, 3).join(', ')}... and ${names.length - 3} more`);
    }
    console.log('');
  }
  
  // Check for 403 errors on most common blobs
  console.log('Checking most shared blobs for 403 errors...\n');
  
  for (const [filename, names] of sorted.slice(0, 5)) {
    const tool = tools.find(t => t.logo?.includes(filename));
    if (tool) {
      try {
        const response = await fetch(tool.logo!, { method: 'HEAD' });
        if (response.status === 403) {
          console.log(`❌ 403 Forbidden: ${filename} (${names.length} tools affected)`);
        } else {
          console.log(`✅ ${response.status}: ${filename}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${filename}`);
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  await prisma.$disconnect();
}

findBrokenLogos();

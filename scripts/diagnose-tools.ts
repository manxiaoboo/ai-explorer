import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  console.log('Diagnosing database...\n');
  
  // Check all tools
  const allTools = await prisma.tool.findMany({
    select: { name: true, slug: true, githubStars: true },
    orderBy: { name: 'asc' }
  });
  
  console.log(`Total tools in database: ${allTools.length}\n`);
  
  // Look for specific tools
  const targetNames = ['Perplexity', 'Gemini', 'ChatGPT', 'Claude', 'Sora'];
  
  for (const name of targetNames) {
    const tool = await prisma.tool.findFirst({
      where: { name: name }
    });
    
    if (tool) {
      console.log(`✓ Found: ${name} (slug: ${tool.slug}, stars: ${tool.githubStars})`);
    } else {
      console.log(`✗ Missing: ${name}`);
      
      // Try partial match
      const partial = await prisma.tool.findFirst({
        where: { name: { contains: name, mode: 'insensitive' } }
      });
      if (partial) {
        console.log(`  Partial match: ${partial.name}`);
      }
    }
  }
  
  await prisma.$disconnect();
}

diagnose().catch(console.error);

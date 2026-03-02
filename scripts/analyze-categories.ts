import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeCategories() {
  console.log('=== Category Analysis ===\n');
  
  // Get all categories with tool counts
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { tools: true }
      }
    }
  });
  
  console.log('Current Categories:');
  console.log('-'.repeat(50));
  
  for (const cat of categories) {
    const activeTools = await prisma.tool.count({
      where: {
        categoryId: cat.id,
        isActive: true
      }
    });
    
    console.log(`${cat.name.padEnd(20)} | ${activeTools.toString().padStart(3)} tools | slug: ${cat.slug}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${categories.length} categories`);
  
  await prisma.$disconnect();
}

analyzeCategories().catch(console.error);

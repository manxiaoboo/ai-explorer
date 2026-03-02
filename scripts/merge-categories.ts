/**
 * Merge duplicate categories
 * Consolidates AI-prefixed categories into their main counterparts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Category merge mapping: [source slug] -> [target slug]
const mergeMap: Record<string, string> = {
  'ai-writing': 'writing',
  'ai-image': 'image',
  'ai-video': 'video',
  'ai-code': 'code',
  'ai-chat': 'chat',
  'ai-audio': 'audio',
  'ai-research': 'research',
  'ai-productivity': 'productivity',
};

async function mergeCategories() {
  console.log('=== Category Merge ===\n');
  
  for (const [sourceSlug, targetSlug] of Object.entries(mergeMap)) {
    console.log(`Merging ${sourceSlug} -> ${targetSlug}...`);
    
    // Find categories
    const sourceCategory = await prisma.category.findUnique({
      where: { slug: sourceSlug },
    });
    
    const targetCategory = await prisma.category.findUnique({
      where: { slug: targetSlug },
    });
    
    if (!sourceCategory) {
      console.log(`  ⚠️ Source category ${sourceSlug} not found, skipping`);
      continue;
    }
    
    if (!targetCategory) {
      console.log(`  ⚠️ Target category ${targetSlug} not found, skipping`);
      continue;
    }
    
    // Count tools to be moved
    const toolsCount = await prisma.tool.count({
      where: { categoryId: sourceCategory.id },
    });
    
    if (toolsCount === 0) {
      console.log(`  ℹ️ No tools in ${sourceSlug}, deleting empty category`);
      await prisma.category.delete({
        where: { id: sourceCategory.id },
      });
      console.log(`  ✅ Deleted empty category ${sourceSlug}`);
      continue;
    }
    
    // Move tools to target category
    const result = await prisma.tool.updateMany({
      where: { categoryId: sourceCategory.id },
      data: { categoryId: targetCategory.id },
    });
    
    console.log(`  ✅ Moved ${result.count} tools from ${sourceSlug} to ${targetSlug}`);
    
    // Delete source category
    await prisma.category.delete({
      where: { id: sourceCategory.id },
    });
    
    console.log(`  ✅ Deleted category ${sourceSlug}`);
  }
  
  console.log('\n=== Merge Complete ===\n');
  
  // Show final state
  const remainingCategories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { tools: true }
      }
    }
  });
  
  console.log('Remaining Categories:');
  console.log('-'.repeat(50));
  
  for (const cat of remainingCategories) {
    const activeTools = await prisma.tool.count({
      where: {
        categoryId: cat.id,
        isActive: true
      }
    });
    
    console.log(`${cat.name.padEnd(20)} | ${activeTools.toString().padStart(3)} tools`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${remainingCategories.length} categories`);
  
  await prisma.$disconnect();
}

mergeCategories().catch(console.error);

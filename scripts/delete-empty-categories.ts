import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(80));
  console.log('🗑️ 删除旧的空分类');
  console.log('='.repeat(80));
  
  // 获取所有分类及其工具数量
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { tools: true } }
    }
  });
  
  // 新分类的slug列表
  const newCategorySlugs = [
    'ai-agents', 'video-creation', 'image-design', 'chat-assistants',
    'developer-tools', 'content-creation', 'productivity-business',
    'education-learning', 'search-research', 'specialized-industries',
    'special-offers'
  ];
  
  // 找出需要删除的分类（工具数为0且不在新分类列表中）
  const toDelete = categories.filter(c => 
    c._count.tools === 0 && !newCategorySlugs.includes(c.slug)
  );
  
  console.log(`\n发现 ${toDelete.length} 个空分类需要删除:\n`);
  
  for (const cat of toDelete) {
    await prisma.category.delete({ where: { id: cat.id } });
    console.log(`✅ 已删除: ${cat.name} (${cat.slug})`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`✅ 已删除 ${toDelete.length} 个空分类`);
  console.log('='.repeat(80));
}

main().catch(console.error);

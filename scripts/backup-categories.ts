import { prisma } from './lib/prisma';
import * as fs from 'fs';

async function main() {
  console.log('='.repeat(80));
  console.log('💾 备份当前分类数据');
  console.log('='.repeat(80));
  
  const categories = await prisma.category.findMany({
    include: {
      tools: { select: { id: true, name: true, slug: true } }
    }
  });
  
  const backup = {
    timestamp: new Date().toISOString(),
    categories: categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      toolCount: c.tools.length,
      toolIds: c.tools.map(t => t.id)
    }))
  };
  
  fs.writeFileSync('/tmp/category-backup.json', JSON.stringify(backup, null, 2));
  
  console.log(`✅ 已备份 ${categories.length} 个分类`);
  console.log(`📁 备份文件: /tmp/category-backup.json`);
  console.log('\n备份内容预览:');
  categories.forEach(c => {
    console.log(`  - ${c.name} (${c.tools.length}个工具)`);
  });
}

main().catch(console.error);

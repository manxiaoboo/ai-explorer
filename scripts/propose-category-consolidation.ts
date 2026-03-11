import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(80));
  console.log('📋 分类精简方案提案');
  console.log('='.repeat(80));
  
  // 查看现有工具详情，以便更好归类
  const tools = await prisma.tool.findMany({
    select: {
      name: true,
      description: true,
      category: { select: { name: true, slug: true } }
    }
  });
  
  // 按当前分类分组显示工具
  const grouped = new Map<string, typeof tools>();
  for (const tool of tools) {
    const catName = tool.category.name;
    if (!grouped.has(catName)) grouped.set(catName, []);
    grouped.get(catName)!.push(tool);
  }
  
  console.log('\n📁 当前分类及工具详情:\n');
  for (const [catName, catTools] of grouped) {
    console.log(`\n【${catName}】(${catTools.length}个工具)`);
    catTools.forEach(t => {
      const shortDesc = t.description.slice(0, 50) + '...';
      console.log(`  - ${t.name}: ${shortDesc}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);

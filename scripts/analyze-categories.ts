import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(80));
  console.log('📊 现有分类分析');
  console.log('='.repeat(80));
  
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { tools: true } }
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`\n总分类数: ${categories.length}\n`);
  console.log('-'.repeat(80));
  console.log('分类名称              | slug                | 工具数量');
  console.log('-'.repeat(80));
  
  for (const cat of categories) {
    const name = cat.name.padEnd(20, ' ');
    const slug = cat.slug.padEnd(20, ' ');
    const count = String(cat._count.tools).padStart(5, ' ');
    console.log(`${name}| ${slug}| ${count}`);
  }
  
  console.log('-'.repeat(80));
  
  // 分析工具的分类分布
  const tools = await prisma.tool.findMany({
    select: {
      name: true,
      category: { select: { name: true, slug: true } }
    }
  });
  
  console.log(`\n📈 统计信息:`);
  console.log(`   总工具数: ${tools.length}`);
  console.log(`   总分类数: ${categories.length}`);
  console.log(`   平均每分类工具数: ${(tools.length / categories.length).toFixed(1)}`);
  
  // 找出工具数为0的分类
  const emptyCats = categories.filter(c => c._count.tools === 0);
  if (emptyCats.length > 0) {
    console.log(`\n⚠️  空分类 (${emptyCats.length}个):`);
    emptyCats.forEach(c => console.log(`   - ${c.name}`));
  }
  
  // 找出只有1个工具的分类
  const singleToolCats = categories.filter(c => c._count.tools === 1);
  if (singleToolCats.length > 0) {
    console.log(`\n⚠️  单工具分类 (${singleToolCats.length}个):`);
    singleToolCats.forEach(c => console.log(`   - ${c.name} (${c._count.tools}个工具)`));
  }
  
  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);

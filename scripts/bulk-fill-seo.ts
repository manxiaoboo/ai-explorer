import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate SEO meta for a tool
function generateToolSEO(tool: any): {
  metaTitle: string;
  metaDescription: string;
} {
  const name = tool.name;
  const category = tool.category?.name || 'AI Tool';
  const tagline = tool.tagline || '';
  const description = tool.description || '';
  
  // Meta title: 50-60 chars
  // Format: {Tool Name} - {Category} AI Tool | AI Explorer
  const suffix = ' | AI Explorer';
  const maxTitleLen = 60 - suffix.length;
  
  let metaTitle = `${name} - ${category} AI Tool${suffix}`;
  if (metaTitle.length > 60) {
    metaTitle = `${name.substring(0, 50)}... - AI Tool${suffix}`;
  }
  
  // Meta description: 150-160 chars
  // Use tagline first, then description
  const baseContent = tagline || description || `${name} is a ${category.toLowerCase()} AI tool.`;
  const cleanContent = baseContent.replace(/\s+/g, ' ').trim();
  
  const descSuffix = ' Discover features, pricing, and alternatives on AI Explorer.';
  const maxDescLen = 160 - descSuffix.length;
  
  let metaDescription = cleanContent.length > maxDescLen
    ? cleanContent.substring(0, maxDescLen - 3) + '...' + descSuffix
    : cleanContent + descSuffix;
  
  // Ensure description doesn't exceed 160
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157) + '...';
  }
  
  return { metaTitle, metaDescription };
}

async function main() {
  console.log('🔧 开始批量补充 SEO meta 信息\n');
  console.log('='.repeat(60));
  
  // Get all tools without SEO meta
  const tools = await prisma.tool.findMany({
    where: {
      OR: [
        { metaTitle: null },
        { metaDescription: null },
      ],
    },
    include: {
      category: true,
    },
  });
  
  console.log(`找到 ${tools.length} 个需要补充 SEO 的工具\n`);
  
  let updated = 0;
  let errors = 0;
  
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const progress = Math.round(((i + 1) / tools.length) * 100);
    
    process.stdout.write(`\r进度: ${progress}% (${i + 1}/${tools.length}) - 处理: ${tool.name.substring(0, 30)}...`);
    
    try {
      const seo = generateToolSEO(tool);
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
        },
      });
      
      updated++;
    } catch (error) {
      errors++;
      console.error(`\n❌ 错误处理 ${tool.name}:`, error);
    }
  }
  
  console.log('\n');
  console.log('='.repeat(60));
  console.log(`✅ 完成: ${updated} 个工具已更新`);
  if (errors > 0) {
    console.log(`❌ 错误: ${errors} 个工具更新失败`);
  }
  
  // Show sample
  console.log('\n📋 示例输出:');
  const sample = await prisma.tool.findFirst({
    where: { metaTitle: { not: null } },
    include: { category: true },
  });
  
  if (sample) {
    console.log(`工具: ${sample.name}`);
    console.log(`标题: ${sample.metaTitle}`);
    console.log(`描述: ${sample.metaDescription?.substring(0, 80)}...`);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);

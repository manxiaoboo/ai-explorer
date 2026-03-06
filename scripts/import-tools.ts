import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// 从 JSON 文件导入工具
// JSON 格式:
// [
//   {
//     "name": "工具名",
//     "slug": "tool-slug",
//     "tagline": "描述",
//     "website": "https://...",
//     "category": "chat",
//     "pricing": "FREEMIUM"
//   }
// ]

async function importFromJSON(filePath: string) {
  const tools = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 获取分类映射
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  
  let success = 0;
  let failed = 0;
  
  for (const tool of tools) {
    try {
      const categoryId = categoryMap.get(tool.category);
      if (!categoryId) {
        console.log(`⚠️ 跳过: ${tool.name} (分类 ${tool.category} 不存在)`);
        failed++;
        continue;
      }
      
      await prisma.tool.upsert({
        where: { slug: tool.slug },
        update: {},
        create: {
          name: tool.name,
          slug: tool.slug,
          tagline: tool.tagline || `${tool.name} is an AI tool`,
          description: tool.description || tool.tagline || `${tool.name} description`,
          website: tool.website,
          categoryId,
          pricingTier: tool.pricing || 'FREEMIUM',
          hasFreeTier: tool.pricing === 'FREE' || tool.pricing === 'FREEMIUM',
          features: tool.features || ['AI powered'],
          useCases: tool.useCases || ['Automation'],
          isActive: true,
          trendingScore: Math.floor(Math.random() * 40) + 10,
        },
      });
      
      console.log(`✅ ${tool.name}`);
      success++;
    } catch (error) {
      console.error(`❌ ${tool.name}:`, error);
      failed++;
    }
  }
  
  console.log(`\n📊 导入完成: ${success} 成功, ${failed} 失败`);
}

// 主函数
async function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('用法: npx tsx scripts/import-tools.ts <tools.json>');
    console.log('');
    console.log('JSON 格式示例:');
    console.log(JSON.stringify([
      {
        name: 'Example Tool',
        slug: 'example-tool',
        tagline: 'An example AI tool',
        website: 'https://example.com',
        category: 'chat',
        pricing: 'FREEMIUM',
        features: ['Feature 1', 'Feature 2'],
        useCases: ['Use case 1']
      }
    ], null, 2));
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    process.exit(1);
  }
  
  await importFromJSON(filePath);
  await prisma.$disconnect();
}

main().catch(console.error);

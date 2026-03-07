#!/usr/bin/env node
/**
 * 导入已抓取的工具到数据库
 * 用法: npx tsx scripts/import-discovered-tools.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_ACCELERATE || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('📥 导入工具到数据库\n');
  
  // 读取 JSON 文件
  const filePath = join(process.cwd(), 'data', 'discovered-tools.json');
  const fileContent = await readFile(filePath, 'utf-8');
  const tools = JSON.parse(fileContent);
  
  console.log(`📂 从文件读取了 ${tools.length} 个工具\n`);
  
  // 获取分类
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  
  console.log('📂 可用分类:');
  categories.forEach(c => console.log(`  - ${c.slug}: ${c.name}`));
  console.log('');
  
  let saved = 0;
  let skipped = 0;
  let failed = 0;
  
  // 按 stars 排序
  const sortedTools = tools.sort((a, b) => b.githubStars - a.githubStars);
  
  for (const tool of sortedTools) {
    try {
      const categoryId = categoryMap.get(tool.categorySlug);
      if (!categoryId) {
        console.log(`  ⚠️ 跳过 ${tool.name}: 未知分类 "${tool.categorySlug}"`);
        skipped++;
        continue;
      }
      
      // 检查是否已存在
      const existing = await prisma.tool.findUnique({
        where: { slug: tool.slug },
      });
      
      if (existing) {
        console.log(`  ⏭️ 跳过 ${tool.name}: 已存在`);
        skipped++;
        continue;
      }
      
      // 创建工具
      await prisma.tool.create({
        data: {
          name: tool.name,
          slug: tool.slug,
          tagline: tool.tagline,
          description: tool.description,
          website: tool.website,
          githubUrl: tool.githubUrl,
          categoryId,
          pricingTier: tool.pricingTier,
          hasFreeTier: tool.hasFreeTier,
          features: tool.features,
          useCases: tool.useCases,
          isActive: true,
          trendingScore: Math.min(Math.floor(tool.githubStars / 100) + Math.floor(Math.random() * 20), 100),
        },
      });
      
      console.log(`  ✅ 已导入: ${tool.name} (${tool.categorySlug})`);
      saved++;
      
    } catch (error) {
      console.error(`  ❌ 失败 ${tool.name}:`, error.message);
      failed++;
    }
    
    // 延迟
    await new Promise(r => setTimeout(r, 100));
  }
  
  const totalTools = await prisma.tool.count();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 导入统计:');
  console.log(`  成功导入: ${saved}`);
  console.log(`  跳过: ${skipped}`);
  console.log(`  失败: ${failed}`);
  console.log(`  数据库总工具数: ${totalTools}`);
  console.log('='.repeat(60));
  
  await prisma.$disconnect();
}

main().catch(error => {
  console.error('❌ 错误:', error);
  process.exit(1);
});

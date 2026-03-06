import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 更新品牌名: AI Explorer → attooli\n');

  // Read and execute SQL
  const sqlPath = path.join(process.cwd(), 'scripts', 'update-brand.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  
  console.log('执行 SQL 更新...\n');
  
  // Split and execute each statement
  const statements = sql.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await prisma.$executeRawUnsafe(statement);
    }
  }

  console.log('✅ SQL 执行完成\n');

  // Verify changes
  const toolCount = await prisma.tool.count({
    where: {
      OR: [
        { metaTitle: { contains: 'AI Explorer' } },
        { metaDescription: { contains: 'AI Explorer' } },
      ],
    },
  });

  const newsCount = await prisma.news.count({
    where: {
      OR: [
        { metaTitle: { contains: 'AI Explorer' } },
        { metaDescription: { contains: 'AI Explorer' } },
      ],
    },
  });

  const attooliToolCount = await prisma.tool.count({
    where: {
      OR: [
        { metaTitle: { contains: 'attooli' } },
        { metaDescription: { contains: 'attooli' } },
      ],
    },
  });

  const attooliNewsCount = await prisma.news.count({
    where: {
      OR: [
        { metaTitle: { contains: 'attooli' } },
        { metaDescription: { contains: 'attooli' } },
      ],
    },
  });

  console.log('验证结果:');
  console.log(`  仍包含 "AI Explorer" 的工具: ${toolCount}`);
  console.log(`  仍包含 "AI Explorer" 的新闻: ${newsCount}`);
  console.log(`  包含 "attooli" 的工具: ${attooliToolCount}`);
  console.log(`  包含 "attooli" 的新闻: ${attooliNewsCount}\n`);

  if (toolCount === 0 && newsCount === 0) {
    console.log('✅ 所有内容已更新为 attooli');
  } else {
    console.log('⚠️ 部分内容可能未更新，请检查');
  }

  console.log('\n' + '='.repeat(50));
  console.log('📧 官方邮箱: billman@attooli.com');
  console.log('🌐 网站名称: attooli');
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

main().catch(console.error);

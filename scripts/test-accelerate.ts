import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_ACCELERATE || process.env.DATABASE_URL;

console.log('Testing database connection...');
console.log('URL:', databaseUrl?.substring(0, 50) + '...');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function test() {
  try {
    // 测试连接
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection successful:', result);

    // 测试工具数量
    const toolCount = await prisma.tool.count();
    console.log(`✅ Tool count: ${toolCount}`);

    // 测试新闻数量  
    const newsCount = await prisma.news.count();
    console.log(`✅ News count: ${newsCount}`);

    console.log('\n✅ All tests passed! Accelerate is working.');
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();

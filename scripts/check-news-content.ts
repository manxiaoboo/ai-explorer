import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNewsContent() {
  const news = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 5
  });

  console.log('=== 已发布新闻内容检查 ===\n');
  for (const n of news) {
    console.log(`标题: ${n.title}`);
    console.log(`内容长度: ${n.content ? n.content.length : 0} 字符`);
    console.log(`内容预览: ${n.content ? n.content.substring(0, 100) + '...' : '空'}`);
    console.log(`AI分析: ${n.aiAnalysis ? '有' : '无'}`);
    console.log('---');
  }
  
  await prisma.$disconnect();
}

checkNewsContent();

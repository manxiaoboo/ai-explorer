import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 检查Vercel Blob图片代理机制');
  console.log('='.repeat(70));
  
  // 查找使用Vercel Blob URL的工具
  const blobTools = await prisma.tool.findMany({
    where: {
      logo: { contains: 'vercel-storage.com' }
    },
    select: { name: true, logo: true },
    take: 5
  });
  
  console.log(`\n找到 ${blobTools.length} 个使用Vercel Blob的工具\n`);
  
  for (const tool of blobTools) {
    console.log(`📌 ${tool.name}`);
    console.log(`   原始URL: ${tool.logo?.slice(0, 70)}...`);
    
    // 提取path
    if (tool.logo) {
      const url = new URL(tool.logo);
      const path = url.pathname.substring(1);
      console.log(`   代理路径: /api/image?path=${path.slice(0, 50)}...`);
    }
    console.log('');
  }
  
  console.log('='.repeat(70));
  console.log('💡 代理API工作流程:');
  console.log('   1. 前端: /api/image?path=logos/auto/xxx.png');
  console.log('   2. API: 使用 get(path, { access: "private" }) 获取签名URL');
  console.log('   3. API: fetch 签名URL获取图片数据');
  console.log('   4. API: 返回图片数据给前端');
  console.log('='.repeat(70));
}

main().catch(console.error);

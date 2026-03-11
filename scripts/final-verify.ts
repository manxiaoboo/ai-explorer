import { prisma } from './lib/prisma';

async function main() {
  const tools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { name: true, logo: true }
  });
  
  let ok = 0;
  let fail = 0;
  
  for (const tool of tools) {
    try {
      // 使用GET请求获取前几个字节
      const response = await fetch(tool.logo!, { 
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        ok++;
      } else {
        fail++;
        console.log(`❌ ${tool.name}: ${response.status}`);
      }
    } catch (e) {
      fail++;
      console.log(`❌ ${tool.name}: 失败`);
    }
  }
  
  console.log(`\n✅ 成功: ${ok}/${tools.length}`);
  console.log(`❌ 失败: ${fail}/${tools.length}`);
}

main().catch(console.error);

import { prisma } from './lib/prisma';

async function main() {
  const failedNames = ['A2E AI Videos', 'Manus', 'HeyFish AI'];
  
  for (const name of failedNames) {
    const tool = await prisma.tool.findFirst({
      where: { name },
      select: { name: true, website: true, logo: true }
    });
    
    if (tool) {
      console.log(`\n📌 ${tool.name}`);
      console.log(`   官网: ${tool.website}`);
      console.log(`   Logo: ${tool.logo}`);
      
      // 尝试直接访问
      if (tool.logo) {
        try {
          const response = await fetch(tool.logo, { signal: AbortSignal.timeout(5000) });
          console.log(`   状态: ${response.status} ${response.statusText}`);
        } catch (e: any) {
          console.log(`   错误: ${e.message}`);
        }
      }
    }
  }
}

main().catch(console.error);

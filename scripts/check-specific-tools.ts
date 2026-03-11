import { prisma } from './lib/prisma';

async function main() {
  const names = ['Manus', 'Nora AI', 'HeyFish AI', 'Atomic Mail', 'Opal44', 'Hostinger OpenClaw Hosting', 'ThumbnailCreator'];
  
  console.log('='.repeat(80));
  console.log('🔍 检查特定工具的完整Logo URL');
  console.log('='.repeat(80));
  
  for (const name of names) {
    const tool = await prisma.tool.findFirst({
      where: { name },
      select: { name: true, website: true, logo: true, id: true }
    });
    
    if (tool) {
      console.log(`\n📌 ${tool.name}`);
      console.log(`   ID: ${tool.id}`);
      console.log(`   官网: ${tool.website}`);
      console.log(`   Logo完整URL:`);
      console.log(`   ${tool.logo || '无'}`);
      
      // 检查是否是X logo
      if (tool.logo) {
        const isX = 
          tool.logo.includes('x.com') ||
          tool.logo.includes('twitter.com') ||
          tool.logo.includes('duckduckgo.com/ip3/x.com') ||
          tool.logo.includes('/x-') ||
          tool.logo.includes('twimg.com');
        
        if (isX) {
          console.log('   ⚠️  ⚠️  ⚠️  这是X的Logo！');
        } else {
          console.log('   ✅ Logo URL正常');
        }
      }
    } else {
      console.log(`\n❌ 未找到: ${name}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);

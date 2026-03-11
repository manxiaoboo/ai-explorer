import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 检查可疑Logo（之前URL指向X的工具）');
  console.log('='.repeat(70));
  
  const suspiciousNames = [
    'Manus', 'Atomic Mail', 'Nora AI', 'Opal44', 
    'HeyFish AI', 'Hostinger OpenClaw Hosting', 'ThumbnailCreator'
  ];
  
  for (const name of suspiciousNames) {
    const tool = await prisma.tool.findFirst({
      where: { name },
      select: { name: true, website: true, logo: true }
    });
    
    if (tool) {
      console.log(`\n📌 ${tool.name}`);
      console.log(`   🌐 当前URL: ${tool.website}`);
      console.log(`   🎨 Logo URL: ${tool.logo?.slice(0, 60)}...`);
      
      // 检查logo是否是X的
      const isXLogo = tool.logo?.includes('x.com') || 
                      tool.logo?.includes('twitter') ||
                      tool.logo?.includes('duckduckgo.com/ip3/x.com');
      
      if (isXLogo) {
        console.log('   ⚠️  ⚠️  ⚠️  这是X的Logo！需要重新抓取');
      } else {
        console.log('   ✅ Logo看起来正常');
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
}

main().catch(console.error);

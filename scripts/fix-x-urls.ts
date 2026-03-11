import { prisma } from './lib/prisma';

// 正确的URL映射
const CORRECT_URLS: Record<string, string> = {
  'Manus': 'https://manus.im',
  'Atomic Mail': 'https://atomicmail.io',
  'Nora AI': 'https://interview.norahq.com',
  'Opal44': 'https://opal44.com',
  'HeyFish AI': 'https://heyfish.ai',
  'Hostinger OpenClaw Hosting': 'https://www.hostinger.com',
  'ThumbnailCreator': 'https://www.thumbnailcreator.com'
};

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 修复指向 X 的URL');
  console.log('='.repeat(70));
  
  let fixed = 0;
  let failed = 0;
  
  for (const [name, correctUrl] of Object.entries(CORRECT_URLS)) {
    const tool = await prisma.tool.findFirst({
      where: { name }
    });
    
    if (!tool) {
      console.log(`❌ 未找到: ${name}`);
      failed++;
      continue;
    }
    
    const isX = tool.website?.includes('x.com') || tool.website?.includes('twitter.com');
    
    if (isX) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: { website: correctUrl }
      });
      console.log(`✅ 已修复: ${name}`);
      console.log(`   ${tool.website} → ${correctUrl}`);
      fixed++;
    } else {
      console.log(`⏭️  无需修复: ${name} (${tool.website})`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`修复完成: ${fixed} 个成功, ${failed} 个失败`);
  console.log('='.repeat(70));
}

main().catch(console.error);

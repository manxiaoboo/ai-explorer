import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(80));
  console.log('🔧 修复14个跳转链接工具的Logo');
  console.log('='.repeat(80));
  
  const fixes = [
    { name: 'AiZolo', domain: 'aizolo.com' },
    { name: 'BASE44', domain: 'base44.com' },
    { name: 'CloneViral', domain: 'cloneviral.com' },
    { name: 'Decktopus', domain: 'decktopus.com' },
    { name: 'Dropmagic', domain: 'dropmagic.com' },
    { name: 'Higgsfield', domain: 'higgsfield.ai' },
    { name: 'Klap', domain: 'klap.app' },
    { name: 'Kling AI', domain: 'klingai.com' },
    { name: 'OpusClip', domain: 'opus.pro' },
    { name: 'PagerGPT', domain: 'pagergpt.com' },
    { name: 'ShortPixel', domain: 'shortpixel.com' },
    { name: 'Stable Commerce', domain: 'stablecommerce.ai' },
    { name: 'Syllaby', domain: 'syllaby.io' },
    { name: 'Taskade', domain: 'taskade.com' },
  ];
  
  let success = 0;
  let failed = 0;
  
  for (const { name, domain } of fixes) {
    const tool = await prisma.tool.findFirst({
      where: { name },
      select: { id: true, name: true, website: true }
    });
    
    if (!tool) {
      console.log(`\n❌ 未找到: ${name}`);
      failed++;
      continue;
    }
    
    console.log(`\n📌 ${tool.name}`);
    console.log(`   当前: ${tool.website}`);
    
    // 策略1: 尝试Clearbit
    const clearbitUrl = `https://logo.clearbit.com/${domain}?size=256`;
    try {
      const resp = await fetch(clearbitUrl, { 
        method: 'HEAD', 
        signal: AbortSignal.timeout(5000) 
      });
      if (resp.ok && resp.headers.get('content-length') !== '0') {
        await prisma.tool.update({
          where: { id: tool.id },
          data: { 
            logo: clearbitUrl,
            website: `https://${domain}` // 同时修复website
          }
        });
        console.log(`   ✅ Clearbit: ${clearbitUrl}`);
        success++;
        continue;
      }
    } catch {}
    
    // 策略2: Google Favicon
    const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    await prisma.tool.update({
      where: { id: tool.id },
      data: { 
        logo: googleUrl,
        website: `https://${domain}`
      }
    });
    console.log(`   ⚠️  Google: ${googleUrl}`);
    success++;
    
    await new Promise(r => setTimeout(r, 600));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`✅ 修复完成: ${success} 个成功, ${failed} 个失败`);
  console.log('='.repeat(80));
}

main().catch(console.error);

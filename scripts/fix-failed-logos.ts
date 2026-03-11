import { prisma } from './lib/prisma';
import { MultiSourceLogoFetcher } from './lib/logo-fetcher';

async function main() {
  const failedNames = ['HeyGen', 'Hostinger OpenClaw Hosting', 'Humanize AI Text', 'NextChat', 'openclaw'];
  
  console.log('修复失败的Logo...\n');
  
  const fetcher = new MultiSourceLogoFetcher();
  await fetcher.init();
  
  for (const name of failedNames) {
    const tool = await prisma.tool.findFirst({
      where: { name },
      select: { id: true, name: true, website: true }
    });
    
    if (!tool) {
      console.log(`❌ 未找到: ${name}`);
      continue;
    }
    
    console.log(`\n📌 ${tool.name}`);
    console.log(`   官网: ${tool.website}`);
    
    // 尝试不同的Logo源
    const domain = tool.website?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    if (domain) {
      // 尝试DuckDuckGo
      const ddgUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      console.log(`   尝试: ${ddgUrl}`);
      
      try {
        const resp = await fetch(ddgUrl, { signal: AbortSignal.timeout(5000) });
        if (resp.ok) {
          await prisma.tool.update({
            where: { id: tool.id },
            data: { logo: ddgUrl }
          });
          console.log('   ✅ 已修复');
          continue;
        }
      } catch {}
    }
    
    // 使用官网favicon作为fallback
    if (tool.website) {
      const faviconUrl = tool.website.replace(/\/$/, '') + '/favicon.ico';
      console.log(`   尝试fallback: ${faviconUrl}`);
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: faviconUrl }
      });
      console.log('   ⚠️  使用fallback');
    }
  }
  
  await fetcher.close();
  await prisma.$disconnect();
  
  console.log('\n✅ 修复完成');
}

main().catch(console.error);

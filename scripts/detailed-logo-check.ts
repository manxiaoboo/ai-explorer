import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 详细检查所有Logo URL');
  console.log('='.repeat(70));
  
  const tools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { name: true, website: true, logo: true },
    orderBy: { updatedAt: 'desc' }
  });
  
  let xLogoCount = 0;
  
  for (const tool of tools) {
    const logoLower = tool.logo?.toLowerCase() || '';
    
    // 检查各种可能的X logo模式
    const isXLogo = 
      logoLower.includes('x.com') ||
      logoLower.includes('twitter.com') ||
      logoLower.includes('twimg.com') ||
      logoLower.includes('abs.twimg.com') ||
      logoLower.includes('duckduckgo.com/ip3/x.com') ||
      logoLower.includes('logo.clearbit.com/x.com') ||
      logoLower.includes('google.com/s2/favicons?domain=x.com');
    
    if (isXLogo) {
      xLogoCount++;
      console.log(`\n⚠️  [${xLogoCount}] ${tool.name}`);
      console.log(`    🌐 官网: ${tool.website}`);
      console.log(`    🎨 Logo: ${tool.logo}`);
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`总计: ${xLogoCount} 个工具使用了X的Logo`);
  console.log(`${'='.repeat(70)}`);
}

main().catch(console.error);

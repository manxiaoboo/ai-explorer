import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(80));
  console.log('🔍 查找真正的X图标来源');
  console.log('='.repeat(80));
  
  const tools = await prisma.tool.findMany({
    select: { name: true, website: true, logo: true },
    orderBy: { name: 'asc' }
  });
  
  // 检查各种可能的X图标模式
  const xPatterns = [
    { pattern: 'x.com', desc: '直接包含x.com' },
    { pattern: 'twitter.com', desc: '包含twitter.com' },
    { pattern: 'twimg.com', desc: '包含twimg.com (Twitter图片域名)' },
    { pattern: 'abs.twimg.com', desc: 'Twitter静态资源域名' },
    { pattern: 'pbs.twimg.com', desc: 'Twitter图片CDN' },
    { pattern: '/x-', desc: '路径包含x-' },
    { pattern: 'X-logo', desc: '文件名包含X-logo' },
    { pattern: 'twitter-logo', desc: '文件名包含twitter-logo' },
    { pattern: 'logo.clearbit.com/x.com', desc: 'Clearbit X logo' },
    { pattern: 'logo.clearbit.com/twitter.com', desc: 'Clearbit Twitter logo' },
  ];
  
  console.log('\n检查所有工具的Logo...\n');
  
  for (const { pattern, desc } of xPatterns) {
    const matches = tools.filter(t => t.logo?.toLowerCase().includes(pattern.toLowerCase()));
    if (matches.length > 0) {
      console.log(`\n🔴 ${desc} (${matches.length}个工具):`);
      matches.forEach(t => {
        console.log(`   - ${t.name}`);
        console.log(`     Logo: ${t.logo}`);
      });
    }
  }
  
  // 检查website是x.com但logo不是的情况
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Website指向x.com但Logo不是X的工具:');
  console.log('-'.repeat(80));
  
  const websiteX = tools.filter(t => t.website?.includes('x.com') || t.website?.includes('twitter.com'));
  if (websiteX.length > 0) {
    console.log(`\n发现 ${websiteX.length} 个工具website指向X:`);
    websiteX.forEach(t => {
      console.log(`\n   ${t.name}`);
      console.log(`   Website: ${t.website}`);
      console.log(`   Logo: ${t.logo || '无'}`);
    });
  } else {
    console.log('✅ 没有工具的website指向X');
  }
  
  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);

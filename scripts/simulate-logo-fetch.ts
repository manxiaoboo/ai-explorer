import { MultiSourceLogoFetcher } from './lib/logo-fetcher';

async function main() {
  console.log('='.repeat(70));
  console.log('🧪 模拟Logo抓取过程（测试X链接）');
  console.log('='.repeat(70));
  
  const fetcher = new MultiSourceLogoFetcher();
  await fetcher.init();
  
  // 测试之前指向X的工具
  const testTools = [
    { name: 'Test X Link', website: 'https://x.com/aitoolsdirect' }
  ];
  
  for (const tool of testTools) {
    console.log(`\n测试: ${tool.name}`);
    console.log(`URL: ${tool.website}`);
    
    const logoUrl = await fetcher.fetchLogo(tool);
    
    if (logoUrl) {
      console.log(`获取到Logo: ${logoUrl}`);
      
      // 检查是否是X的logo
      if (logoUrl.includes('x.com') || logoUrl.includes('twitter.com')) {
        console.log('⚠️  ⚠️  ⚠️  这是X的Logo！');
      }
    } else {
      console.log('未获取到Logo');
    }
  }
  
  await fetcher.close();
}

main().catch(console.error);

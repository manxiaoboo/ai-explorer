import { chromium } from 'playwright-core';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 调试 aitoolsdirectory.com 的链接结构');
  console.log('='.repeat(70));
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  // 访问首页
  console.log('\n📡 访问 https://aitoolsdirectory.com...\n');
  await page.goto('https://aitoolsdirectory.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 分析工具卡片
  const tools = await page.evaluate(() => {
    const cards = document.querySelectorAll('.sv-tile.sv-size-small');
    const results = [];
    
    for (const card of cards) {
      const nameEl = card.querySelector('h3, .title, [class*="title"]');
      const name = nameEl?.textContent?.trim() || 'Unknown';
      
      // 查找所有链接
      const links = Array.from(card.querySelectorAll('a'));
      const linkInfo = links.map(a => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim().slice(0, 30),
        class: a.className
      }));
      
      // 查找点击按钮
      const visitBtn = card.querySelector('a[href*="x.com"], a[href*="twitter.com"], button');
      
      results.push({ name, linkInfo, hasX: !!visitBtn });
    }
    
    return results;
  });
  
  console.log(`找到 ${tools.length} 个工具卡片\n`);
  
  tools.slice(0, 5).forEach((tool, i) => {
    console.log(`\n[${i+1}] ${tool.name}`);
    console.log(`    链接数量: ${tool.linkInfo.length}`);
    console.log(`    是否含X链接: ${tool.hasX ? '是 ⚠️' : '否'}`);
    tool.linkInfo.forEach((link, j) => {
      const isX = link.href?.includes('x.com') || link.href?.includes('twitter.com');
      const marker = isX ? ' 🔴' : '';
      console.log(`    [${j+1}] ${link.href?.slice(0, 60)}${marker}`);
    });
  });
  
  await browser.close();
  
  console.log('\n' + '='.repeat(70));
  console.log('🔍 问题分析：');
  console.log('   aitoolsdirectory.com 可能使用 JavaScript 动态加载链接');
  console.log('   或者使用了跳转链接追踪系统');
  console.log('   需要检查页面源码中的实际链接结构');
  console.log('='.repeat(70));
}

main().catch(console.error);

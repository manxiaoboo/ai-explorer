import { chromium } from 'playwright-core';

async function main() {
  console.log('🔍 分析页面原始HTML...\n');
  
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // 禁用JavaScript，查看原始HTML
  await page.route('**/*', route => route.continue());
  
  // 访问并获取HTML
  await page.goto('https://aitoolsdirectory.com', { waitUntil: 'domcontentloaded' });
  
  const html = await page.content();
  
  // 搜索X链接
  const xMatches = html.match(/href="https:\/\/(x\.com|twitter\.com)[^"]*"/g);
  
  console.log('=== 原始HTML中包含的X链接 ===');
  if (xMatches) {
    console.log(`找到 ${xMatches.length} 个X链接:`);
    xMatches.slice(0, 10).forEach((match, i) => {
      console.log(`  ${i+1}. ${match}`);
    });
  } else {
    console.log('未发现X链接');
  }
  
  // 也检查JavaScript加载后的情况
  await page.waitForTimeout(3000);
  
  const afterJs = await page.evaluate(() => {
    const xLinks = Array.from(document.querySelectorAll('a[href*="x.com"], a[href*="twitter.com"]'));
    return xLinks.map(a => ({
      href: a.getAttribute('href'),
      text: a.textContent?.trim(),
      parent: a.parentElement?.className
    }));
  });
  
  console.log('\n=== JavaScript执行后的X链接 ===');
  if (afterJs.length > 0) {
    console.log(`找到 ${afterJs.length} 个X链接:`);
    afterJs.slice(0, 10).forEach((link, i) => {
      console.log(`  ${i+1}. ${link.href}`);
      console.log(`      文本: ${link.text}`);
      console.log(`      父元素: ${link.parent}`);
    });
  } else {
    console.log('未发现X链接');
  }
  
  await browser.close();
}

main().catch(console.error);

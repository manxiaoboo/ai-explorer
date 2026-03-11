import { chromium } from 'playwright-core';

async function main() {
  console.log('🔍 调查 X 链接来源...\n');
  
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // 访问 aitoolsdirectory.com
  await page.goto('https://aitoolsdirectory.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // 查找这些特定工具
  const targetNames = ['Manus', 'Atomic Mail', 'Nora AI', 'Opal44', 'HeyFish AI', 'Hostinger'];
  
  for (const targetName of targetNames) {
    console.log(`\n📌 查找: ${targetName}`);
    
    // 滚动查找工具
    const found = await page.evaluate((name) => {
      const cards = document.querySelectorAll('.sv-tile.sv-size-small');
      for (const card of cards) {
        const nameEl = card.querySelector('h3, .sv-product__title');
        const cardName = nameEl?.textContent?.trim();
        
        if (cardName?.toLowerCase().includes(name.toLowerCase())) {
          // 获取所有http链接
          const links = Array.from(card.querySelectorAll('a[href^="http"]'));
          return {
            found: true,
            name: cardName,
            links: links.map(a => a.getAttribute('href'))
          };
        }
      }
      return { found: false };
    }, targetName);
    
    if (found.found) {
      console.log(`   找到: ${found.name}`);
      console.log(`   链接: ${JSON.stringify(found.links)}`);
      
      // 检查是否有X链接
      const hasX = found.links?.some((l) => l?.includes('x.com') || l?.includes('twitter.com')) ?? false;
      if (hasX) {
        console.log('   ⚠️  ⚠️  ⚠️  发现 X 链接！');
      }
    } else {
      console.log('   未在当前页面找到');
    }
  }
  
  await browser.close();
}

main().catch(console.error);

#!/usr/bin/env tsx
/**
 * 测试脚本 - 测试 aitoolsdirectory.com 抓取功能
 * 用法: npx tsx scripts/test-scrape.ts
 */

import { AIToolsDirectoryScraper } from './lib/aitools-scraper';

async function main() {
  console.log('测试 aitoolsdirectory.com 抓取功能\n');
  console.log('='.repeat(60));
  
  const scraper = new AIToolsDirectoryScraper();
  
  try {
    await scraper.init();
    
    console.log('正在抓取首页工具...\n');
    const tools = await scraper.scrapeCategoryPage('https://aitoolsdirectory.com');
    
    console.log(`成功抓取 ${tools.length} 个工具\n`);
    
    tools.slice(0, 5).forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   类别: ${tool.category}`);
      console.log(`   价格: ${tool.pricing}`);
      console.log(`   描述: ${tool.description.slice(0, 80)}...`);
      console.log(`   网站: ${tool.website || 'N/A'}`);
      console.log(`   详情页: ${tool.detailUrl || 'N/A'}`);
      console.log();
    });

  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await scraper.close();
  }
}

main();

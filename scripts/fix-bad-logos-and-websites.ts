#!/usr/bin/env tsx
/**
 * 修复错误的website和logo
 * 问题：从aitoolsdirectory抓取时，website被错误地设置为跳转链接
 * 解决：搜索真实的官网地址并重新抓取logo
 */

import { prisma } from './lib/prisma';
import { chromium } from 'playwright-core';
import { put } from '@vercel/blob';

const BAD_LOGO_PATTERN = 'link.aitoolsdirectory.com.ico';
const DELAY_BETWEEN_REQUESTS = 3000;

// 已知工具的真实官网映射（根据工具名称手动设置）
const KNOWN_WEBSITES: Record<string, string> = {
  '1of10': 'https://1of10.com',
  'AdCreative.ai': 'https://www.adcreative.ai',
  'AiAssistWorks': 'https://aiassistworks.com',
  'Artlist': 'https://artlist.io',
  'Blaze': 'https://www.blaze.ai',
  'Brilliant Directories': 'https://www.brilliantdirectories.com',
  'ClickRank': 'https://clickrank.ai',
  'Clickup': 'https://clickup.com',
  'Emergent': 'https://emergent.sh',
  'Freebeat': 'https://www.freebeat.ai',
  'Galaxy AI': 'https://www.galaxy.ai',
  'Gamma': 'https://gamma.app',
  'Groas': 'https://groas.io',
  'Leonardo AI': 'https://leonardo.ai',
  'MosaChat-AI': 'https://www.mosachat.com',
  'Quickads': 'https://quickads.ai',
  'Submagic': 'https://www.submagic.co',
};

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

class LogoFetcher {
  private browser: any;

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async fetchLogo(website: string, toolName: string): Promise<string | null> {
    if (!website) return null;

    let context: any;
    let page: any;

    try {
      context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      page = await context.newPage();

      const response = await page.goto(website, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      }).catch(() => null);

      if (!response) {
        console.log(`  ❌ 网站访问失败: ${website}`);
        return null;
      }

      await page.waitForTimeout(1000);

      // 策略1: 获取favicon
      let logoUrl = await this.getFavicon(page, website);

      // 策略2: 查找meta标签
      if (!logoUrl) {
        logoUrl = await this.getMetaImage(page);
      }

      // 策略3: 通过关键词查找logo
      if (!logoUrl) {
        logoUrl = await this.getLogoByKeyword(page, toolName);
      }

      // 策略4: 正方形图片
      if (!logoUrl) {
        logoUrl = await this.getFirstSquareImage(page);
      }

      await context.close();

      if (logoUrl) {
        logoUrl = this.resolveUrl(logoUrl, website);
        return logoUrl;
      }

      return null;

    } catch (error: any) {
      console.log(`  ❌ 错误: ${error.message.slice(0, 50)}`);
      try { await context?.close(); } catch {}
      return null;
    }
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('//')) {
      return 'https:' + url;
    } else if (url.startsWith('/')) {
      const origin = new URL(baseUrl).origin;
      return origin + url;
    } else if (!url.startsWith('http')) {
      const origin = new URL(baseUrl).origin;
      return origin + '/' + url;
    }
    return url;
  }

  private async getFavicon(page: any, website: string): Promise<string | null> {
    try {
      const selectors = [
        'link[rel="icon"][sizes="any"][type="image/svg+xml"]',
        'link[rel="icon"][type="image/svg+xml"]',
        'link[rel="shortcut icon"]',
        'link[rel="icon"]',
        'link[rel="apple-touch-icon"]',
      ];

      for (const selector of selectors) {
        const href = await page.locator(selector).first().getAttribute('href').catch(() => null);
        if (href) return href;
      }

      return `${new URL(website).origin}/favicon.ico`;
    } catch {
      return null;
    }
  }

  private async getMetaImage(page: any): Promise<string | null> {
    try {
      const selectors = [
        'meta[property="og:image"]',
        'meta[property="og:logo"]',
        'meta[name="twitter:image"]',
      ];

      for (const selector of selectors) {
        const content = await page.locator(selector).first().getAttribute('content').catch(() => null);
        if (content) return content;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async getLogoByKeyword(page: any, toolName: string): Promise<string | null> {
    try {
      return await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));

        const logoImg = images.find(img => {
          const alt = img.alt?.toLowerCase() || '';
          const cls = img.className?.toLowerCase() || '';
          const src = img.src?.toLowerCase() || '';
          return (alt.includes('logo') || cls.includes('logo') || src.includes('logo')) &&
                 img.width >= 20 && img.width <= 500;
        });

        if (logoImg) return logoImg.src;

        const headerImg = document.querySelector('header img, nav img, .navbar img');
        if (headerImg) return (headerImg as HTMLImageElement).src;

        return null;
      });
    } catch {
      return null;
    }
  }

  private async getFirstSquareImage(page: any): Promise<string | null> {
    try {
      return await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const squareImg = images.find(img => {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          return Math.abs(w - h) < 10 && w >= 32 && w <= 512;
        });
        return squareImg?.src || null;
      });
    } catch {
      return null;
    }
  }

  async downloadAndUpload(logoUrl: string, toolName: string): Promise<string | null> {
    try {
      const response = await fetch(logoUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        console.log(`    ⚠️ 下载失败: ${response.status}`);
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        console.log(`    ⚠️ 非图片: ${contentType.slice(0, 30)}`);
        return null;
      }

      const buffer = await response.arrayBuffer();

      if (buffer.byteLength < 512 || buffer.byteLength > 5 * 1024 * 1024) {
        console.log(`    ⚠️ 大小不合适: ${(buffer.byteLength/1024).toFixed(1)}KB`);
        return null;
      }

      const ext = contentType.includes('svg') ? 'svg' :
                  contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' :
                  contentType.includes('ico') ? 'ico' : 'png';

      const filename = `logos/fixed/${generateSlug(toolName)}-${Date.now()}.${ext}`;

      const blob = await put(filename, Buffer.from(buffer), {
        contentType,
        access: 'private',
      });

      console.log(`    ✅ 上传成功`);
      return blob.url;

    } catch (error: any) {
      console.log(`    ❌ 上传失败: ${error.message.slice(0, 40)}`);
      return null;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 修复错误的 Website 和 Logo');
  console.log('='.repeat(70));
  console.log();

  // 查询所有有问题的工具
  const toolsWithBadLogo = await prisma.tool.findMany({
    where: {
      logo: {
        contains: BAD_LOGO_PATTERN
      }
    },
    select: {
      id: true,
      name: true,
      website: true,
      logo: true,
      slug: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`⚠️  找到 ${toolsWithBadLogo.length} 个需要修复的工具\n`);

  if (toolsWithBadLogo.length === 0) {
    console.log('✅ 没有需要修复的工具！');
    await prisma.$disconnect();
    return;
  }

  // 显示当前状态
  console.log('📋 当前问题工具:\n');
  toolsWithBadLogo.forEach((tool, index) => {
    const realWebsite = KNOWN_WEBSITES[tool.name];
    console.log(`${index + 1}. ${tool.name}`);
    console.log(`   当前错误URL: ${tool.website}`);
    console.log(`   将更新为: ${realWebsite || '⚠️ 未知 - 需要手动设置'}`);
    console.log();
  });

  // 确认是否有未知website的工具
  const unknownTools = toolsWithBadLogo.filter(t => !KNOWN_WEBSITES[t.name]);
  if (unknownTools.length > 0) {
    console.log(`\n⚠️ 警告: 有 ${unknownTools.length} 个工具没有设置真实官网地址:`);
    unknownTools.forEach(t => console.log(`   - ${t.name}`));
    console.log('\n请先更新 KNOWN_WEBSITES 映射后再运行此脚本。\n');
    await prisma.$disconnect();
    return;
  }

  // 初始化浏览器
  const fetcher = new LogoFetcher();
  await fetcher.init();

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  // 逐个修复
  for (let i = 0; i < toolsWithBadLogo.length; i++) {
    const tool = toolsWithBadLogo[i];
    const realWebsite = KNOWN_WEBSITES[tool.name];

    console.log(`\n[${i + 1}/${toolsWithBadLogo.length}] ${tool.name}`);
    console.log(`   原URL: ${tool.website}`);
    console.log(`   新URL: ${realWebsite}`);

    if (!realWebsite) {
      console.log(`   ⏭️ 跳过: 未知真实官网地址`);
      skipCount++;
      continue;
    }

    // 抓取新的logo
    console.log(`   🔍 抓取Logo...`);
    const logoUrl = await fetcher.fetchLogo(realWebsite, tool.name);

    if (!logoUrl) {
      console.log(`   ❌ 无法抓取Logo`);
      failCount++;
      continue;
    }

    console.log(`   🌐 Logo源: ${logoUrl.slice(0, 60)}...`);

    // 下载并上传
    console.log(`   📤 上传CDN...`);
    const cdnUrl = await fetcher.downloadAndUpload(logoUrl, tool.name);

    if (!cdnUrl) {
      console.log(`   ❌ 上传失败`);
      failCount++;
      continue;
    }

    // 更新数据库
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        website: realWebsite,
        logo: cdnUrl
      }
    });

    console.log(`   ✅ 修复成功!`);
    console.log(`   🎨 新Logo: ${cdnUrl.slice(0, 60)}...`);
    successCount++;

    // 延迟
    if (i < toolsWithBadLogo.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));
    }
  }

  await fetcher.close();
  await prisma.$disconnect();

  console.log();
  console.log('='.repeat(70));
  console.log('🎉 修复完成!');
  console.log(`📊 总计: ${toolsWithBadLogo.length} 个工具`);
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failCount} 个`);
  console.log(`⏭️ 跳过: ${skipCount} 个`);
  console.log('='.repeat(70));
}

main().catch(console.error);

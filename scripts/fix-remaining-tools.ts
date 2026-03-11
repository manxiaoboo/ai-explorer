#!/usr/bin/env tsx
/**
 * 修复剩余的工具 (从第4个开始)
 */

import { prisma } from './lib/prisma';
import { chromium } from 'playwright-core';
import { put } from '@vercel/blob';

const BAD_LOGO_PATTERN = 'link.aitoolsdirectory.com.ico';
const DELAY_BETWEEN_REQUESTS = 2000;

// 剩余工具的真实官网映射
const REMAINING_WEBSITES: Record<string, string> = {
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
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      });

      page = await context.newPage();

      const response = await page.goto(website, {
        waitUntil: 'domcontentloaded',
        timeout: 12000
      }).catch(() => null);

      if (!response) {
        console.log(`  ❌ 网站访问失败: ${website}`);
        return null;
      }

      await page.waitForTimeout(800);

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

      await context.close();

      if (logoUrl) {
        logoUrl = this.resolveUrl(logoUrl, website);
      }

      return logoUrl;

    } catch (error: any) {
      console.log(`  ❌ 错误: ${error.message.slice(0, 40)}`);
      try { await context?.close(); } catch {}
      return null;
    }
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return new URL(baseUrl).origin + url;
    if (!url.startsWith('http')) return new URL(baseUrl).origin + '/' + url;
    return url;
  }

  private async getFavicon(page: any, website: string): Promise<string | null> {
    try {
      const selectors = [
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

        const headerImg = document.querySelector('header img, nav img');
        if (headerImg) return (headerImg as HTMLImageElement).src;

        return null;
      });
    } catch {
      return null;
    }
  }

  async downloadAndUpload(logoUrl: string, toolName: string): Promise<string | null> {
    try {
      const response = await fetch(logoUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        console.log(`    ⚠️ 下载失败: ${response.status}`);
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        console.log(`    ⚠️ 非图片: ${contentType.slice(0, 20)}`);
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

      return blob.url;

    } catch (error: any) {
      console.log(`    ❌ 上传失败: ${error.message.slice(0, 30)}`);
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
  console.log('🔧 修复剩余的工具');
  console.log('='.repeat(70));
  console.log();

  // 获取剩余需要修复的工具
  const tools = await prisma.tool.findMany({
    where: {
      logo: { contains: BAD_LOGO_PATTERN },
      name: { in: Object.keys(REMAINING_WEBSITES) }
    },
    select: { id: true, name: true, website: true, logo: true },
    orderBy: { name: 'asc' }
  });

  console.log(`📋 剩余 ${tools.length} 个工具需要修复\n`);

  if (tools.length === 0) {
    console.log('✅ 没有需要修复的工具！');
    await prisma.$disconnect();
    return;
  }

  const fetcher = new LogoFetcher();
  await fetcher.init();

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const realWebsite = REMAINING_WEBSITES[tool.name];

    console.log(`\n[${i + 1}/${tools.length}] ${tool.name}`);
    console.log(`   新URL: ${realWebsite}`);

    // 抓取Logo
    const logoUrl = await fetcher.fetchLogo(realWebsite, tool.name);

    if (!logoUrl) {
      console.log(`   ❌ 无法抓取Logo`);
      failCount++;
      continue;
    }

    console.log(`   🔍 Logo: ${logoUrl.slice(0, 50)}...`);

    // 下载并上传
    const cdnUrl = await fetcher.downloadAndUpload(logoUrl, tool.name);

    if (!cdnUrl) {
      console.log(`   ❌ 上传失败`);
      failCount++;
      continue;
    }

    // 更新数据库
    await prisma.tool.update({
      where: { id: tool.id },
      data: { website: realWebsite, logo: cdnUrl }
    });

    console.log(`   ✅ 成功!`);
    successCount++;

    if (i < tools.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));
    }
  }

  await fetcher.close();
  await prisma.$disconnect();

  console.log();
  console.log('='.repeat(70));
  console.log('🎉 修复完成!');
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failCount} 个`);
  console.log('='.repeat(70));
}

main().catch(console.error);

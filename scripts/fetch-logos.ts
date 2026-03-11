#!/usr/bin/env tsx
/**
 * 智能Logo抓取脚本
 * 功能：为数据库中已有的工具抓取官网Logo
 * 策略：
 * 1. 访问工具官网
 * 2. 多重策略识别Logo（favicon, meta标签, 语义分析）
 * 3. 下载并上传到CDN
 * 4. 更新数据库
 */

import { prisma } from './lib/prisma';
import { chromium } from 'playwright-core';
import { put } from '@vercel/blob';

const DELAY_BETWEEN_REQUESTS = 2000; // 2秒延迟

interface ToolWithLogo {
  id: string;
  name: string;
  website: string | null;
  logo: string | null;
}

// 生成slug
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// 智能Logo检测类
class LogoFetcher {
  private browser: any;

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async fetchLogo(tool: ToolWithLogo): Promise<string | null> {
    if (!tool.website) {
      console.log(`  ⚠️ 无官网链接`);
      return null;
    }

    let website = tool.website;
    if (!website.startsWith('http')) {
      website = `https://${website}`;
    }
    
    let context: any;
    let page: any;
    
    try {
      // 每个工具使用独立的context，避免相互影响
      context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      page = await context.newPage();
      
      // 访问网站，使用较短的超时
      const response = await page.goto(website, { 
        waitUntil: 'domcontentloaded', 
        timeout: 10000 
      }).catch(() => null);
      
      if (!response) {
        console.log(`  ❌ 网站访问失败`);
        return null;
      }
      
      // 等待图片加载
      await page.waitForTimeout(800);

      // 策略1: 获取favicon
      let logoUrl = await this.getFavicon(page, website);
      
      // 策略2: 查找meta标签
      if (!logoUrl) {
        logoUrl = await this.getMetaImage(page);
      }
      
      // 策略3: 通过关键词查找logo
      if (!logoUrl) {
        logoUrl = await this.getLogoByKeyword(page, tool.name);
      }
      
      // 策略4: 正方形图片
      if (!logoUrl) {
        logoUrl = await this.getFirstSquareImage(page);
      }

      if (logoUrl) {
        // 处理相对路径
        logoUrl = this.resolveUrl(logoUrl, website);
        console.log(`  🔍 Logo: ${logoUrl.slice(0, 70)}...`);
      }

      await context.close();
      return logoUrl;

    } catch (error: any) {
      console.log(`  ❌ 错误: ${error.message.slice(0, 50)}`);
      try { await context?.close(); } catch {}
      return null;
    }
  }

  // 解析相对URL
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

  // 策略1: 获取favicon
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

      // 尝试默认favicon
      return `${new URL(website).origin}/favicon.ico`;
    } catch {
      return null;
    }
  }

  // 策略2: 获取meta图片
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

  // 策略3: 通过关键词查找logo
  private async getLogoByKeyword(page: any, toolName: string): Promise<string | null> {
    try {
      return await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        
        // 找包含logo关键词的图片
        const logoImg = images.find(img => {
          const alt = img.alt?.toLowerCase() || '';
          const cls = img.className?.toLowerCase() || '';
          const src = img.src?.toLowerCase() || '';
          return (alt.includes('logo') || cls.includes('logo') || src.includes('logo')) &&
                 img.width >= 20 && img.width <= 500;
        });
        
        if (logoImg) return logoImg.src;

        // 找header/nav中的第一张图片
        const headerImg = document.querySelector('header img, nav img, .navbar img');
        if (headerImg) return (headerImg as HTMLImageElement).src;

        return null;
      });
    } catch {
      return null;
    }
  }

  // 策略4: 正方形图片
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

  // 下载并上传Logo
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
        console.log(`    ⚠️ 非图片: ${contentType.slice(0, 30)}`);
        return null;
      }

      const buffer = await response.arrayBuffer();
      
      // 验证大小
      if (buffer.byteLength < 512 || buffer.byteLength > 5 * 1024 * 1024) {
        console.log(`    ⚠️ 大小不合适: ${(buffer.byteLength/1024).toFixed(1)}KB`);
        return null;
      }

      const ext = contentType.includes('svg') ? 'svg' :
                  contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' :
                  contentType.includes('ico') ? 'ico' : 'png';

      const filename = `logos/auto/${generateSlug(toolName)}-${Date.now()}.${ext}`;

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

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('🎨 智能Logo抓取');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();

  // 获取需要抓取Logo的工具
  const tools = await prisma.tool.findMany({
    where: {
      logo: null,
      website: { not: undefined }
    },
    select: { id: true, name: true, website: true, logo: true },
    take: 15,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`找到 ${tools.length} 个需要Logo的工具\n`);

  if (tools.length === 0) {
    console.log('✅ 所有工具都已有Logo！');
    return;
  }

  const fetcher = new LogoFetcher();
  await fetcher.init();

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    console.log(`\n[${i + 1}/${tools.length}] ${tool.name}`);
    console.log(`  🌐 ${tool.website}`);

    // 抓取Logo URL
    const logoUrl = await fetcher.fetchLogo(tool);

    if (!logoUrl) {
      failed++;
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));
      continue;
    }

    // 下载并上传
    const cdnUrl = await fetcher.downloadAndUpload(logoUrl, tool.name);

    if (cdnUrl) {
      // 更新数据库
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: cdnUrl }
      });
      success++;
    } else {
      failed++;
    }

    // 延迟
    if (i < tools.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));
    }
  }

  await fetcher.close();
  await prisma.$disconnect();

  console.log();
  console.log('='.repeat(60));
  console.log('🎉 Logo抓取完成!');
  console.log(`📊 处理: ${tools.length} 个`);
  console.log(`✅ 成功: ${success} 个`);
  console.log(`❌ 失败: ${failed} 个`);
  console.log('='.repeat(60));
}

main().catch(console.error);

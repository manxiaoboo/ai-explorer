#!/usr/bin/env tsx
/**
 * 多途径智能Logo抓取脚本
 * 策略优先级：
 * 1. 官网favicon/logo抓取
 * 2. Clearbit Logo API (免费)
 * 3. Google Favicon Service
 * 4. DuckDuckGo Instant Answer
 * 5. 尝试直接访问常见logo路径
 */

import { prisma } from './lib/prisma';
import { chromium } from 'playwright-core';
import { put } from '@vercel/blob';

const DELAY_BETWEEN_REQUESTS = 1000;

interface ToolInfo {
  id: string;
  name: string;
  website: string | null;
}

// 生成slug
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// 提取域名
function extractDomain(url: string): string | null {
  try {
    if (!url.startsWith('http')) url = 'https://' + url;
    const hostname = new URL(url).hostname;
    // 移除www前缀
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// 多源Logo抓取器
class MultiSourceLogoFetcher {
  private browser: any;

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  // 主方法：尝试所有来源
  async fetchLogo(tool: ToolInfo): Promise<string | null> {
    if (!tool.website) {
      console.log(`  ⚠️ 无官网`);
      return null;
    }

    const domain = extractDomain(tool.website);
    if (!domain) {
      console.log(`  ⚠️ 无效域名`);
      return null;
    }

    console.log(`  🔍 域名: ${domain}`);

    // 策略1: Clearbit Logo API (免费，无需key)
    let logoUrl = await this.tryClearbit(domain);
    if (logoUrl) return logoUrl;

    // 策略2: Google Favicon Service
    logoUrl = await this.tryGoogleFavicon(domain);
    if (logoUrl) return logoUrl;

    // 策略3: DuckDuckGo Logo
    logoUrl = await this.tryDuckDuckGo(domain);
    if (logoUrl) return logoUrl;

    // 策略4: 官网抓取
    logoUrl = await this.tryOfficialWebsite(tool.website);
    if (logoUrl) return logoUrl;

    // 策略5: 常见路径猜测
    logoUrl = await this.tryCommonPaths(tool.website);
    if (logoUrl) return logoUrl;

    console.log(`  ❌ 所有来源都失败`);
    return null;
  }

  // 策略1: Clearbit Logo API
  private async tryClearbit(domain: string): Promise<string | null> {
    try {
      const url = `https://logo.clearbit.com/${domain}?size=256`;
      console.log(`  📡 尝试 Clearbit...`);
      
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        // Clearbit会返回一个像素占位图如果找不到logo
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 1000) { // 不是占位图
          console.log(`  ✅ Clearbit 成功`);
          return url;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // 策略2: Google Favicon Service
  private async tryGoogleFavicon(domain: string): Promise<string | null> {
    try {
      const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
      console.log(`  📡 尝试 Google Favicon...`);
      
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        // Google返回16x16的默认图标大约是500字节
        if (buffer.byteLength > 800) {
          console.log(`  ✅ Google Favicon 成功`);
          return url;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // 策略3: DuckDuckGo Instant Answer
  private async tryDuckDuckGo(domain: string): Promise<string | null> {
    try {
      const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      console.log(`  📡 尝试 DuckDuckGo...`);
      
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 200) {
          console.log(`  ✅ DuckDuckGo 成功`);
          return url;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // 策略4: 官网抓取
  private async tryOfficialWebsite(website: string): Promise<string | null> {
    let context: any;
    let page: any;
    
    try {
      console.log(`  📡 尝试 官网抓取...`);
      
      let url = website;
      if (!url.startsWith('http')) url = 'https://' + url;

      context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      });
      
      page = await context.newPage();
      
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 8000 
      }).catch(() => null);
      
      if (!response) return null;
      
      await page.waitForTimeout(500);

      // 多策略找logo
      let logoUrl = await this.getFaviconFromPage(page, url);
      
      if (!logoUrl) {
        logoUrl = await this.getManifestIcon(page, url);
      }
      
      if (!logoUrl) {
        logoUrl = await this.getMetaImage(page);
      }

      await context.close();

      if (logoUrl) {
        console.log(`  ✅ 官网抓取 成功`);
        return this.resolveUrl(logoUrl, url);
      }
      return null;

    } catch (error) {
      try { await context?.close(); } catch {}
      return null;
    }
  }

  // 策略5: 常见路径猜测
  private async tryCommonPaths(website: string): Promise<string | null> {
    try {
      console.log(`  📡 尝试 常见路径...`);
      
      let baseUrl = website;
      if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl;
      const origin = new URL(baseUrl).origin;

      const commonPaths = [
        '/logo.png',
        '/logo.svg',
        '/images/logo.png',
        '/images/logo.svg',
        '/img/logo.png',
        '/assets/logo.png',
        '/static/logo.png',
        '/brand/logo.png',
        '/icon.png',
        '/icon.svg',
        '/apple-touch-icon.png',
        '/mstile-150x150.png',
      ];

      for (const path of commonPaths) {
        const url = origin + path;
        try {
          const response = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(3000)
          });
          if (response.ok) {
            console.log(`  ✅ 常见路径 成功: ${path}`);
            return url;
          }
        } catch {}
      }
      return null;
    } catch {
      return null;
    }
  }

  // 从页面获取favicon
  private async getFaviconFromPage(page: any, baseUrl: string): Promise<string | null> {
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

      return `${new URL(baseUrl).origin}/favicon.ico`;
    } catch {
      return null;
    }
  }

  // 从manifest获取
  private async getManifestIcon(page: any, baseUrl: string): Promise<string | null> {
    try {
      const manifestUrl = await page.locator('link[rel="manifest"]').first().getAttribute('href').catch(() => null);
      if (!manifestUrl) return null;

      const resolvedUrl = this.resolveUrl(manifestUrl, baseUrl);
      const response = await fetch(resolvedUrl, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) return null;

      const manifest = await response.json();
      if (manifest.icons && manifest.icons.length > 0) {
        // 找最大的图标
        const icon = manifest.icons.reduce((a: any, b: any) => {
          const sizeA = parseInt(a.sizes?.split('x')[0]) || 0;
          const sizeB = parseInt(b.sizes?.split('x')[0]) || 0;
          return sizeA > sizeB ? a : b;
        });
        return icon.src;
      }
      return null;
    } catch {
      return null;
    }
  }

  // 获取meta图片
  private async getMetaImage(page: any): Promise<string | null> {
    try {
      const content = await page.locator('meta[property="og:image"]').first().getAttribute('content').catch(() => null);
      return content;
    } catch {
      return null;
    }
  }

  // 解析相对URL
  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return new URL(baseUrl).origin + url;
    if (!url.startsWith('http')) return new URL(baseUrl).origin + '/' + url;
    return url;
  }

  // 下载并上传
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
        console.log(`    ⚠️ 非图片: ${contentType.slice(0, 20)}`);
        return null;
      }

      const buffer = await response.arrayBuffer();
      if (buffer.byteLength < 200 || buffer.byteLength > 5 * 1024 * 1024) {
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

      console.log(`    ✅ 上传成功: ${blob.url.slice(0, 50)}...`);
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

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('🎨 多途径智能Logo抓取');
  console.log('来源: Clearbit → Google → DuckDuckGo → 官网 → 常见路径');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();

  // 获取需要Logo的工具
  const tools = await prisma.tool.findMany({
    where: {
      logo: null,
      website: { not: undefined }
    },
    select: { id: true, name: true, website: true },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`找到 ${tools.length} 个需要Logo的工具\n`);

  if (tools.length === 0) {
    console.log('✅ 所有工具都已有Logo！');
    return;
  }

  const fetcher = new MultiSourceLogoFetcher();
  await fetcher.init();

  let success = 0;
  let failed = 0;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    console.log(`\n[${i + 1}/${tools.length}] ${tool.name}`);
    console.log(`  🌐 ${tool.website}`);

    // 尝试所有来源获取Logo
    const logoUrl = await fetcher.fetchLogo(tool);

    if (!logoUrl) {
      failed++;
      console.log(`  ❌ 全部来源失败`);
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

    if (i < tools.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));
    }
  }

  await fetcher.close();
  await prisma.$disconnect();

  console.log();
  console.log('='.repeat(60));
  console.log('🎉 多途径Logo抓取完成!');
  console.log(`📊 处理: ${tools.length} 个`);
  console.log(`✅ 成功: ${success} 个`);
  console.log(`❌ 失败: ${failed} 个`);
  console.log('='.repeat(60));
}

main().catch(console.error);

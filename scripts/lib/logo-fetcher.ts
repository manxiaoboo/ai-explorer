/**
 * 多途径Logo抓取器 - 下载并上传到CDN
 * 支持：Clearbit → Google → DuckDuckGo → 官网 → 常见路径
 * 所有成功获取的Logo都会上传到Vercel Blob CDN
 */

import { chromium } from 'playwright-core';
import { put } from '@vercel/blob';

export interface ToolInfo {
  id?: string;
  name: string;
  website: string | null;
}

// 提取域名
function extractDomain(url: string): string | null {
  try {
    if (!url.startsWith('http')) url = 'https://' + url;
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// 生成slug
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export class MultiSourceLogoFetcher {
  private browser: any;

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  // 主方法：尝试所有来源，下载并上传到CDN
  async fetchLogo(tool: ToolInfo): Promise<string | null> {
    if (!tool.website) {
      return null;
    }

    const domain = extractDomain(tool.website);
    if (!domain) {
      return null;
    }

    // 尝试各个来源
    const sources = [
      { name: 'Clearbit', url: `https://logo.clearbit.com/${domain}?size=256` },
      { name: 'DuckDuckGo', url: `https://icons.duckduckgo.com/ip3/${domain}.ico` },
      { name: 'Google', url: `https://www.google.com/s2/favicons?domain=${domain}&sz=256` },
    ];

    // 尝试外部API来源
    for (const source of sources) {
      const cdnUrl = await this.tryDownloadAndUpload(source.url, tool.name, source.name);
      if (cdnUrl) {
        console.log(`    ✅ 使用 ${source.name} Logo，已上传CDN`);
        return cdnUrl;
      }
    }

    // 尝试官网抓取
    const officialLogo = await this.tryOfficialWebsite(tool.website, tool.name);
    if (officialLogo) {
      return officialLogo;
    }

    // 尝试常见路径
    return await this.tryCommonPaths(tool.website, tool.name);
  }

  // 下载并上传到CDN
  private async tryDownloadAndUpload(
    imageUrl: string, 
    toolName: string, 
    sourceName: string
  ): Promise<string | null> {
    try {
      // 设置合适的headers
      const headers: Record<string, string> = {
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      };

      if (imageUrl.includes('google.com')) {
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        headers['Referer'] = 'https://www.google.com/';
      } else {
        headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
      }

      const response = await fetch(imageUrl, {
        headers,
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) return null;

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) return null;

      const buffer = await response.arrayBuffer();

      // 验证大小
      if (buffer.byteLength < 100 || buffer.byteLength > 5 * 1024 * 1024) {
        return null;
      }

      // 上传到CDN
      return await this.uploadToCdn(Buffer.from(buffer), toolName, contentType);

    } catch {
      return null;
    }
  }

  // 上传到Vercel Blob CDN
  private async uploadToCdn(
    buffer: Buffer,
    toolName: string,
    contentType: string
  ): Promise<string | null> {
    try {
      const ext = contentType.includes('svg') ? 'svg' :
                  contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' :
                  contentType.includes('ico') ? 'ico' : 'png';

      const filename = `logos/auto/${generateSlug(toolName)}-${Date.now()}.${ext}`;

      const blob = await put(filename, buffer, {
        contentType,
        access: 'private',
      });

      return blob.url;
    } catch (error) {
      console.log(`    ⚠️ CDN上传失败: ${error}`);
      return null;
    }
  }

  // 官网抓取
  private async tryOfficialWebsite(website: string, toolName: string): Promise<string | null> {
    let context: any;
    let page: any;
    
    try {
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

      let logoUrl = await this.getFaviconFromPage(page, url);
      if (!logoUrl) logoUrl = await this.getMetaImage(page);

      await context.close();

      if (logoUrl) {
        logoUrl = this.resolveUrl(logoUrl, url);
        // 下载并上传
        return await this.tryDownloadAndUpload(logoUrl, toolName, 'Official');
      }
      return null;
    } catch {
      try { await context?.close(); } catch {}
      return null;
    }
  }

  // 常见路径
  private async tryCommonPaths(website: string, toolName: string): Promise<string | null> {
    try {
      let baseUrl = website;
      if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl;
      const origin = new URL(baseUrl).origin;

      const paths = ['/logo.png', '/logo.svg', '/images/logo.png', '/icon.png', '/apple-touch-icon.png'];
      
      for (const path of paths) {
        const url = origin + path;
        const cdnUrl = await this.tryDownloadAndUpload(url, toolName, 'CommonPath');
        if (cdnUrl) {
          console.log(`    ✅ 使用常见路径 Logo，已上传CDN`);
          return cdnUrl;
        }
      }
      return null;
    } catch { return null; }
  }

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
    } catch { return null; }
  }

  private async getMetaImage(page: any): Promise<string | null> {
    try {
      return await page.locator('meta[property="og:image"]').first().getAttribute('content').catch(() => null);
    } catch { return null; }
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return new URL(baseUrl).origin + url;
    if (!url.startsWith('http')) return new URL(baseUrl).origin + '/' + url;
    return url;
  }

  // 批量抓取并更新（上传到CDN）
  async fetchAndGetUrl(tool: ToolInfo): Promise<string | null> {
    return await this.fetchLogo(tool);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

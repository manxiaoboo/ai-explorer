/**
 * 健壮的 Logo 抓取器 - 带验证和自动修复
 * 基于原 logo-fetcher.ts 增强，添加了验证和修复机制
 */

import { chromium } from 'playwright-core';
import { isSuspiciousUrl, isPlaceholderLogo, searchRealWebsite, resolveRedirectUrl } from './validators';

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

export class RobustLogoFetcher {
  private browser: any;
  private verificationCache: Map<string, boolean> = new Map();

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  /**
   * 主方法：获取并验证 Logo
   * 如果发现 website 有问题，会尝试修复
   */
  async fetchLogoWithValidation(tool: ToolInfo): Promise<{ 
    logo: string | null; 
    website: string | null;
    wasFixed: boolean;
    issues: string[] | undefined;
  }> {
    const issues: string[] = [];
    let wasFixed = false;
    let workingWebsite = tool.website;

    // 步骤1: 验证 website
    if (isSuspiciousUrl(workingWebsite)) {
      issues.push(`可疑URL: ${workingWebsite}`);
      
      // 尝试修复 URL
      const fixed = await this.fixWebsiteUrl(tool.name, workingWebsite);
      if (fixed && fixed !== workingWebsite) {
        workingWebsite = fixed;
        wasFixed = true;
        issues.push(`已修复为: ${workingWebsite}`);
      }
    }

    if (!workingWebsite) {
      issues.push('无法获取有效的 website URL');
      return { logo: null, website: workingWebsite, wasFixed, issues };
    }

    // 步骤2: 抓取 Logo
    const logoUrl = await this.fetchLogo({ name: tool.name, website: workingWebsite });

    // 步骤3: 验证 Logo
    if (logoUrl && isPlaceholderLogo(logoUrl)) {
      issues.push(`抓到占位符 Logo: ${logoUrl}`);
      
      // 尝试使用备用方法
      const fallbackLogo = await this.fetchWithFallback({ name: tool.name, website: workingWebsite });
      
      if (fallbackLogo && !isPlaceholderLogo(fallbackLogo)) {
        return { 
          logo: fallbackLogo, 
          website: workingWebsite, 
          wasFixed: true, 
          issues: [...issues, '已使用备用方法获取 Logo'] 
        };
      }
      
      return { logo: null, website: workingWebsite, wasFixed, issues };
    }

    return { 
      logo: logoUrl, 
      website: workingWebsite, 
      wasFixed, 
      issues: issues.length > 0 ? issues : undefined 
    };
  }

  /**
   * 修复可疑的 website URL
   */
  private async fixWebsiteUrl(name: string, suspiciousUrl: string | null): Promise<string | null> {
    // 方法1: 从已知映射查找
    const known = await searchRealWebsite(name);
    if (known) return known;

    // 方法2: 如果是跳转链接，尝试解析
    if (suspiciousUrl) {
      const resolved = await resolveRedirectUrl(suspiciousUrl);
      if (resolved && !isSuspiciousUrl(resolved)) {
        return resolved;
      }
    }

    // 方法3: 尝试常见模式（最后手段）
    const guessed = this.generateProbableUrl(name);
    if (guessed && await this.verifyWebsiteExists(guessed)) {
      return guessed;
    }

    return suspiciousUrl;
  }

  /**
   * 生成可能的官网地址
   */
  private generateProbableUrl(name: string): string | null {
    const clean = name
      .replace(/\.ai$/i, '')
      .replace(/\.com$/i, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    
    return `https://${clean}.com`;
  }

  /**
   * 验证网站是否存在
   */
  private async verifyWebsiteExists(url: string): Promise<boolean> {
    if (this.verificationCache.has(url)) {
      return this.verificationCache.get(url)!;
    }

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        redirect: 'follow'
      });
      
      const exists = response.ok;
      this.verificationCache.set(url, exists);
      return exists;
    } catch {
      this.verificationCache.set(url, false);
      return false;
    }
  }

  /**
   * 原始 fetchLogo 方法（多策略）
   */
  async fetchLogo(tool: ToolInfo): Promise<string | null> {
    if (!tool.website) return null;

    const domain = extractDomain(tool.website);
    if (!domain) return null;

    // 策略1: Clearbit Logo API
    const clearbitUrl = `https://logo.clearbit.com/${domain}?size=256`;
    if (await this.checkImageAccessible(clearbitUrl)) {
      return clearbitUrl;
    }

    // 策略2: Google Favicon Service
    const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    if (await this.checkGoogleFavicon(googleUrl)) {
      return googleUrl;
    }

    // 策略3: DuckDuckGo Logo
    const ddgUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    if (await this.checkImageAccessible(ddgUrl)) {
      return ddgUrl;
    }

    // 策略4: 官网抓取
    const officialLogo = await this.tryOfficialWebsite(tool.website);
    if (officialLogo) return officialLogo;

    // 策略5: 常见路径
    return await this.tryCommonPaths(tool.website);
  }

  /**
   * 备用抓取方法（当主方法失败或抓到占位符时使用）
   */
  private async fetchWithFallback(tool: ToolInfo): Promise<string | null> {
    if (!tool.website) return null;

    // 尝试更激进的策略
    const domain = extractDomain(tool.website);
    if (!domain) return null;

    // 备用1: 尝试直接 favicon
    const faviconUrl = `https://${domain}/favicon.ico`;
    if (await this.checkImageAccessible(faviconUrl)) {
      return faviconUrl;
    }

    // 备用2: 尝试 Apple Touch Icon
    const appleIcon = `https://${domain}/apple-touch-icon.png`;
    if (await this.checkImageAccessible(appleIcon)) {
      return appleIcon;
    }

    // 备用3: 使用 Unavatar 服务
    const unavatarUrl = `https://unavatar.io/${domain}`;
    if (await this.checkImageAccessible(unavatarUrl)) {
      return unavatarUrl;
    }

    // 备用4: 使用 Icon Horse
    const iconHorseUrl = `https://icon.horse/icon/${domain}`;
    if (await this.checkImageAccessible(iconHorseUrl)) {
      return iconHorseUrl;
    }

    return null;
  }

  // 检查图片是否可访问且不是占位图
  private async checkImageAccessible(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) return false;
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) return false;
      
      return true;
    } catch {
      return false;
    }
  }

  // 检查Google Favicon（排除默认小图标）
  private async checkGoogleFavicon(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return false;
      
      const buffer = await response.arrayBuffer();
      return buffer.byteLength > 1000;
    } catch {
      return false;
    }
  }

  // 官网抓取
  private async tryOfficialWebsite(website: string): Promise<string | null> {
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
        if (await this.checkImageAccessible(logoUrl)) {
          return logoUrl;
        }
      }
      return null;
    } catch {
      try { await context?.close(); } catch {}
      return null;
    }
  }

  // 常见路径
  private async tryCommonPaths(website: string): Promise<string | null> {
    try {
      let baseUrl = website;
      if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl;
      const origin = new URL(baseUrl).origin;

      const paths = ['/logo.png', '/logo.svg', '/images/logo.png', '/icon.png'];
      
      for (const path of paths) {
        const url = origin + path;
        if (await this.checkImageAccessible(url)) {
          return url;
        }
      }
      return null;
    } catch { return null; }
  }

  private async getFaviconFromPage(page: any, baseUrl: string): Promise<string | null> {
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

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

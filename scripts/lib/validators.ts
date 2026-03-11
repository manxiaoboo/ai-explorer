/**
 * URL 和 Logo 验证工具
 * 用于检测和修复抓取过程中出现的错误数据
 */

import { chromium } from 'playwright-core';

// 已知的跳转/链接缩短域名
const SUSPICIOUS_DOMAINS = [
  'link.aitoolsdirectory.com',
  'r.aitoolsdirectory.com',
  'outgoing.aitoolsdirectory.com',
  'bit.ly',
  't.ly',
  'short.link',
  'redirect',
  'clk',
  'affiliate',
];

// 已知的占位图标模式
const PLACEHOLDER_PATTERNS = [
  'link.aitoolsdirectory.com.ico',
  'aitoolsdirectory.com.ico',
  'default-icon',
  'placeholder',
  'missing',
  'not-found',
];

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  fixedUrl?: string;
  fixedLogo?: string;
}

/**
 * 检查 URL 是否是可疑的跳转链接
 */
export function isSuspiciousUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  
  const lowerUrl = url.toLowerCase();
  return SUSPICIOUS_DOMAINS.some(domain => lowerUrl.includes(domain));
}

/**
 * 检查 Logo URL 是否是占位符
 */
export function isPlaceholderLogo(logoUrl: string | null | undefined): boolean {
  if (!logoUrl) return true;
  
  const lowerLogo = logoUrl.toLowerCase();
  return PLACEHOLDER_PATTERNS.some(pattern => lowerLogo.includes(pattern));
}

/**
 * 从工具名称搜索真实官网
 */
export async function searchRealWebsite(toolName: string): Promise<string | null> {
  // 优先匹配已知工具
  const knownWebsites: Record<string, string> = {
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

  // 直接匹配
  if (knownWebsites[toolName]) {
    return knownWebsites[toolName];
  }

  // 尝试使用搜索引擎查找（简化版本）
  // 实际使用时可以通过搜索API获取
  return null;
}

/**
 * 验证并修复工具数据
 */
export async function validateAndFixTool(
  name: string,
  website: string | null | undefined,
  logo: string | null | undefined
): Promise<ValidationResult> {
  const result: ValidationResult = { isValid: true };

  // 检查 website 是否可疑
  if (isSuspiciousUrl(website)) {
    result.isValid = false;
    result.reason = `可疑的跳转链接: ${website}`;
    
    // 尝试修复
    const fixed = await searchRealWebsite(name);
    if (fixed) {
      result.fixedUrl = fixed;
      console.log(`  🔧 修复 URL: ${website} → ${fixed}`);
    }
  }

  // 检查 logo 是否是占位符
  if (isPlaceholderLogo(logo)) {
    result.isValid = false;
    result.reason = result.reason || `占位符 Logo: ${logo}`;
    
    // logo 需要重新抓取，这里返回 undefined 表示需要重新获取
    result.fixedLogo = undefined;
  }

  return result;
}

/**
 * 尝试从跳转链接获取真实 URL
 * 有些跳转链接可以直接解析出目标地址
 */
export function extractRealUrlFromRedirect(redirectUrl: string): string | null {
  try {
    // 解析 URL 参数
    const url = new URL(redirectUrl);
    
    // 常见的跳转参数名
    const paramNames = ['url', 'to', 'target', 'redirect', 'dest', 'link'];
    
    for (const param of paramNames) {
      const value = url.searchParams.get(param);
      if (value) {
        // 解码并验证
        const decoded = decodeURIComponent(value);
        if (decoded.startsWith('http') && !isSuspiciousUrl(decoded)) {
          return decoded;
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * 使用 Playwright 访问跳转链接并获取真实地址
 */
export async function resolveRedirectUrl(redirectUrl: string): Promise<string | null> {
  let browser: any = null;
  let context: any = null;
  let page: any = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });

    page = await context.newPage();

    // 拦截请求以获取最终 URL
    let finalUrl: string | null = null;
    
    page.on('response', async (response: any) => {
      if (response.status() === 301 || response.status() === 302) {
        const location = response.headers()['location'];
        if (location && !isSuspiciousUrl(location)) {
          finalUrl = location;
        }
      }
    });

    // 访问跳转链接
    const response = await page.goto(redirectUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // 获取最终 URL
    const currentUrl = page.url();
    if (!isSuspiciousUrl(currentUrl)) {
      finalUrl = currentUrl;
    }

    await context.close();
    await browser.close();

    return finalUrl;
  } catch (error) {
    try { await context?.close(); } catch {}
    try { await browser?.close(); } catch {}
    return null;
  }
}

/**
 * 生成搜索建议的官网地址
 */
export function generateProbableWebsite(toolName: string): string | null {
  // 清理工具名称
  const cleanName = toolName
    .replace(/\.ai$/i, '')
    .replace(/app$/i, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  // 常见域名后缀尝试
  const tlds = ['.com', '.io', '.ai', '.co', '.app'];
  
  // 这里只返回最可能的猜测，实际验证需要外部检查
  return `https://www.${cleanName}.com`;
}

/**
 * 批量验证工具列表
 */
export async function validateToolsBatch(
  tools: Array<{ name: string; website: string | null; logo: string | null }>
): Promise<Array<{ tool: typeof tools[0]; result: ValidationResult }>> {
  const results = [];
  
  for (const tool of tools) {
    const result = await validateAndFixTool(tool.name, tool.website, tool.logo);
    results.push({ tool, result });
  }
  
  return results;
}

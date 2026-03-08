import { chromium } from 'playwright';

/**
 * Enhanced content extraction with rich format preservation
 * Converts HTML to Markdown instead of plain text
 */

export interface RichContent {
  markdown: string;
  excerpt: string;
  images: Array<{
    originalUrl: string;
    alt?: string;
  }>;
  tables: number;
}

// Convert HTML to Markdown
export function htmlToMarkdown(html: string, baseUrl: string): RichContent {
  const images: RichContent['images'] = [];
  let tableCount = 0;
  
  // Step 1: Extract and count tables
  let processed = html.replace(/\u003ctable[^\u003e]*\u003e[\s\S]*?\u003c\/table\u003e/gi, () => {
    tableCount++;
    return '\n\n[Table: See original article for full table data]\n\n';
  });
  
  // Step 2: Extract images
  processed = processed.replace(/\u003cimg[^\u003e]+src=["']([^"']+)["'][^\u003e]*\u003e/gi, (match, src) => {
    const altMatch = match.match(/alt=["']([^"]*)["']/i);
    const alt = altMatch ? altMatch[1] : '';
    
    // Resolve relative URLs
    let fullUrl = src;
    if (!src.startsWith('http')) {
      try {
        fullUrl = new URL(src, baseUrl).href;
      } catch {}
    }
    
    const id = images.length;
    images.push({ originalUrl: fullUrl, alt });
    
    return alt ? `\n\n![${alt}](${fullUrl})\n\n` : `\n\n![](${fullUrl})\n\n`;
  });
  
  // Step 3: Convert to Markdown
  let markdown = processed
    // Headers
    .replace(/\u003ch1[^\u003e]*\u003e([\s\S]*?)\u003c\/h1\u003e/gi, '\n\n# $1\n\n')
    .replace(/\u003ch2[^\u003e]*\u003e([\s\S]*?)\u003c\/h2\u003e/gi, '\n\n## $1\n\n')
    .replace(/\u003ch3[^\u003e]*\u003e([\s\S]*?)\u003c\/h3\u003e/gi, '\n\n### $1\n\n')
    .replace(/\u003ch4[^\u003e]*\u003e([\s\S]*?)\u003c\/h4\u003e/gi, '\n\n#### $1\n\n')
    
    // Bold and italic
    .replace(/\u003c(strong|b)[^\u003e]*\u003e([\s\S]*?)\u003c\/(strong|b)\u003e/gi, '**$2**')
    .replace(/\u003c(em|i)[^\u003e]*\u003e([\s\S]*?)\u003c\/(em|i)\u003e/gi, '*$2*')
    
    // Code
    .replace(/\u003cpre[^\u003e]*\u003e[\s\S]*?\u003ccode[^\u003e]*\u003e([\s\S]*?)\u003c\/code\u003e[\s\S]*?\u003c\/pre\u003e/gi, '\n\n```\n$1\n```\n\n')
    .replace(/\u003ccode[^\u003e]*\u003e([\s\S]*?)\u003c\/code\u003e/gi, '`$1`')
    
    // Blockquotes
    .replace(/\u003cblockquote[^\u003e]*\u003e([\s\S]*?)\u003c\/blockquote\u003e/gi, '\n\n> $1\n\n')
    
    // Lists - unordered
    .replace(/\u003cul[^\u003e]*\u003e([\s\S]*?)\u003c\/ul\u003e/gi, (match, content) => {
      const items = content.match(/\u003cli[^\u003e]*\u003e([\s\S]*?)\u003c\/li\u003e/gi) || [];
      return '\n\n' + items.map((item: string) => {
        const text = item.replace(/\u003cli[^\u003e]*\u003e|\u003c\/li\u003e/gi, '').trim();
        return '* ' + text;
      }).join('\n') + '\n\n';
    })
    
    // Lists - ordered
    .replace(/\u003col[^\u003e]*\u003e([\s\S]*?)\u003c\/ol\u003e/gi, (match, content) => {
      const items = content.match(/\u003cli[^\u003e]*\u003e([\s\S]*?)\u003c\/li\u003e/gi) || [];
      let counter = 1;
      return '\n\n' + items.map((item: string) => {
        const text = item.replace(/\u003cli[^\u003e]*\u003e|\u003c\/li\u003e/gi, '').trim();
        return `${counter++}. ` + text;
      }).join('\n') + '\n\n';
    })
    
    // Links
    .replace(/\u003ca[^\u003e]+href=["']([^"']+)["'][^\u003e]*\u003e([\s\S]*?)\u003c\/a\u003e/gi, (match, href, text) => {
      let fullUrl = href;
      if (!href.startsWith('http')) {
        try {
          fullUrl = new URL(href, baseUrl).href;
        } catch {}
      }
      return `[${text.trim()}](${fullUrl})`;
    })
    
    // Line breaks
    .replace(/\u003cbr\s*\/?\u003e/gi, '\n')
    .replace(/\u003cp[^\u003e]*\u003e([\s\S]*?)\u003c\/p\u003e/gi, '\n\n$1\n\n')
    
    // Remove remaining tags
    .replace(/\u003c[^\u003e]+\u003e/g, ' ')
    
    // Clean up
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  
  // Generate excerpt (first 200 chars without images/markdown)
  const excerpt = markdown
    .replace(/!\[.*?\]\(.*?\)/g, '[Image]')
    .replace(/\[.*?\]\(.*?\)/g, '$1')
    .replace(/[#*_`]/g, '')
    .replace(/\n/g, ' ')
    .substring(0, 200)
    .trim() + '...';
  
  return { markdown, excerpt, images, tables: tableCount };
}

// Fetch rich content using Playwright
export async function fetchRichContent(
  url: string, 
  selectors: string[],
  options: { extractImages?: boolean } = {}
): Promise<RichContent | null> {
  let browser;
  
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(2000);
    
    // Try each selector to find content
    let htmlContent = '';
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          htmlContent = await element.innerHTML();
          if (htmlContent.length > 500) break;
        }
      } catch {}
    }
    
    // Fallback to body
    if (!htmlContent) {
      htmlContent = await page.$eval('article, main, [role="main"], .content, .post-content', 
        el => el.innerHTML
      ).catch(() => '');
    }
    
    if (!htmlContent) {
      htmlContent = await page.content();
    }
    
    await browser.close();
    
    if (!htmlContent || htmlContent.length < 300) {
      return null;
    }
    
    return htmlToMarkdown(htmlContent, url);
    
  } catch (error) {
    console.error('Fetch error:', (error as Error).message);
    if (browser) await browser.close();
    return null;
  }
}

/**
 * Smart Content Extractor
 * Identifies and removes unrelated content (nav, ads, buttons, etc.)
 * Uses readability algorithms and heuristics
 */

import { chromium } from 'playwright';

export interface ExtractedContent {
  markdown: string;
  html: string;
  title: string;
  excerpt: string;
  images: Array<{ url: string; alt: string }>;
}

// Common patterns for noise elements
const NOISE_SELECTORS = [
  // Navigation
  'nav', 'header', '.header', '#header', '.navbar', '#navbar',
  '.navigation', '#navigation', '.menu', '#menu', '.sidebar', '#sidebar',
  
  // Ads
  '.ad', '.ads', '.advertisement', '.sponsored', '[class*="ad-"]',
  '[class*="ads-"]', '[id*="ad-"]', '[id*="ads-"]', '.banner-ad',
  
  // Social sharing
  '.social-share', '.share-buttons', '.social-media', '.follow-us',
  
  // Comments
  '.comments', '#comments', '.comment-section', '#disqus',
  
  // Related content
  '.related', '.related-posts', '.related-articles', '.recommended',
  '.you-may-like', '.more-stories', '.read-more',
  
  // Footers
  'footer', '.footer', '#footer', '.site-footer', '.copyright',
  
  // Newsletter / CTA
  '.newsletter', '.subscribe', '.signup-form', '.email-capture',
  
  // Author bio (optional - sometimes useful)
  '.author-bio', '.about-author', '.author-box',
  
  // Tags/Categories lists at bottom
  '.tag-list', '.category-list', '.post-tags', '.entry-tags',
];

// Link text patterns that indicate noise
const NOISE_LINK_PATTERNS = [
  /^read more$/i,
  /^continue reading$/i,
  /^learn more$/i,
  /^click here$/i,
  /^download$/i,
  /^subscribe$/i,
  /^sign up$/i,
  /^share$/i,
  /^tweet$/i,
  /^facebook$/i,
  /^linkedin$/i,
  /^copy link$/i,
  /^print$/i,
  /^edit$/i,
  /^delete$/i,
  /^reply$/i,
  /^comment$/i,
  /^load more$/i,
  /^show more$/i,
  /^view all$/i,
  /^see all$/i,
  /^previous$/i,
  /^next$/i,
  /^back$/i,
  /^home$/i,
  /^about$/i,
  /^contact$/i,
  /^privacy$/i,
  /^terms$/i,
  /^cookie/i,
];

// Calculate text density for content scoring
function calculateTextDensity(element: Element): number {
  const text = element.textContent || '';
  const textLength = text.trim().length;
  const linkLength = Array.from(element.querySelectorAll('a'))
    .reduce((sum, a) => sum + (a.textContent || '').length, 0);
  
  // High link density = probably navigation/noise
  if (textLength === 0) return 0;
  const linkDensity = linkLength / textLength;
  return linkDensity < 0.3 ? textLength : textLength * (1 - linkDensity);
}

// Find main content container
function findMainContent(doc: Document): Element {
  // Try semantic HTML5 tags first
  const article = doc.querySelector('article');
  if (article) return article;
  
  const main = doc.querySelector('main');
  if (main) return main;
  
  // Try common content selectors
  const contentSelectors = [
    '[role="main"]',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.content-body',
    '.post-body',
    '.entry-body',
    '#content',
    '.content',
    '.prose',
  ];
  
  for (const selector of contentSelectors) {
    const el = doc.querySelector(selector);
    if (el && el.textContent && el.textContent.length > 200) {
      return el;
    }
  }
  
  // Fallback: find element with highest text density
  const candidates = doc.querySelectorAll('div, section');
  let bestElement = doc.body;
  let bestScore = 0;
  
  candidates.forEach(el => {
    const score = calculateTextDensity(el);
    if (score > bestScore && score > 500) {
      bestScore = score;
      bestElement = el;
    }
  });
  
  return bestElement;
}

// Clean HTML by removing noise elements
function cleanHtmlContent(html: string, baseUrl: string): { html: string; images: Array<{ url: string; alt: string }> } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images: Array<{ url: string; alt: string }> = [];
  
  // Find main content
  const mainContent = findMainContent(doc);
  
  // Remove noise elements
  NOISE_SELECTORS.forEach(selector => {
    mainContent.querySelectorAll(selector).forEach(el => {
      // Don't remove if it contains substantial article text
      const text = el.textContent || '';
      if (text.length < 100 || el.querySelector('p')) {
        el.remove();
      }
    });
  });
  
  // Remove elements by link text patterns
  mainContent.querySelectorAll('a').forEach(link => {
    const text = (link.textContent || '').trim();
    if (NOISE_LINK_PATTERNS.some(pattern => pattern.test(text))) {
      // Replace with just the text if it's not a meaningful link
      const textNode = doc.createTextNode(text + ' ');
      link.parentNode?.replaceChild(textNode, link);
    }
  });
  
  // Remove buttons
  mainContent.querySelectorAll('button').forEach(btn => btn.remove());
  
  // Remove empty paragraphs and divs
  mainContent.querySelectorAll('p, div').forEach(el => {
    if (!el.textContent?.trim() && !el.querySelector('img')) {
      el.remove();
    }
  });
  
  // Collect images before converting
  mainContent.querySelectorAll('img').forEach(img => {
    let src = img.getAttribute('src') || '';
    // Resolve relative URLs
    if (src.startsWith('/')) {
      const base = new URL(baseUrl);
      src = `${base.protocol}//${base.host}${src}`;
    } else if (!src.startsWith('http')) {
      try {
        src = new URL(src, baseUrl).href;
      } catch {}
    }
    images.push({
      url: src,
      alt: img.getAttribute('alt') || ''
    });
  });
  
  return {
    html: mainContent.innerHTML,
    images
  };
}

// Convert cleaned HTML to Markdown
function htmlToMarkdown(html: string, baseUrl: string): string {
  let processed = html
    // Remove script and style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Convert to Markdown
  return processed
    // Headers
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n')
    
    // Bold and italic
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**')
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*')
    
    // Code
    .replace(/<pre[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi, '\n\n```\n$1\n```\n\n')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    
    // Blockquotes
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n\n> $1\n\n')
    
    // Lists
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      return '\n\n' + items.map((item: string) => {
        const text = item.replace(/<li[^>]*>|<\/li>/gi, '').trim();
        return '* ' + text;
      }).join('\n') + '\n\n';
    })
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      let counter = 1;
      return '\n\n' + items.map((item: string) => {
        const text = item.replace(/<li[^>]*>|<\/li>/gi, '').trim();
        return `${counter++}. ` + text;
      }).join('\n') + '\n\n';
    })
    
    // Images
    .replace(/<img[^>]+src=["']([^"']+)["'][^\u003e]*>/gi, (match, src) => {
      const altMatch = match.match(/alt=["']([^"]*)["']/i);
      const alt = altMatch ? altMatch[1] : '';
      let fullUrl = src;
      if (src.startsWith('/')) {
        const base = new URL(baseUrl);
        fullUrl = `${base.protocol}//${base.host}${src}`;
      } else if (!src.startsWith('http')) {
        try {
          fullUrl = new URL(src, baseUrl).href;
        } catch {}
      }
      return alt ? `\n\n![${alt}](${fullUrl})\n\n` : `\n\n![](${fullUrl})\n\n`;
    })
    
    // Links
    .replace(/<a[^>]+href=["']([^"']+)["'][^\u003e]*>([\s\S]*?)<\/a>/gi, (match, href, text) => {
      let fullUrl = href;
      if (!href.startsWith('http')) {
        try {
          fullUrl = new URL(href, baseUrl).href;
        } catch {}
      }
      return `[${text.trim()}](${fullUrl})`;
    })
    
    // Paragraphs and breaks
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')
    
    // Tables
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '\n\n*[Table: See original article for data]*\n\n')
    
    // Remove remaining tags
    .replace(/<[^\u003e]+>/g, ' ')
    
    // Clean up
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// Main extraction function
export async function extractSmartContent(
  url: string,
  selectors: string[] = []
): Promise<ExtractedContent | null> {
  let browser;
  
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Get page title
    const title = await page.title();
    
    // Get raw HTML content
    let rawHtml = '';
    for (const selector of selectors) {
      try {
        const el = await page.$(selector);
        if (el) {
          rawHtml = await el.innerHTML();
          if (rawHtml.length > 500) break;
        }
      } catch {}
    }
    
    if (!rawHtml) {
      rawHtml = await page.$eval('article, main, [role="main"]', 
        el => el.innerHTML
      ).catch(() => '');
    }
    
    await browser.close();
    
    if (!rawHtml || rawHtml.length < 300) {
      return null;
    }
    
    // Clean and extract
    const cleaned = cleanHtmlContent(rawHtml, url);
    const markdown = htmlToMarkdown(cleaned.html, url);
    
    // Generate excerpt
    const excerpt = markdown
      .replace(/!\[.*?\]\(.*?\)/g, '[Image]')
      .replace(/\[.*?\]\(.*?\)/g, '$1')
      .replace(/[#*_`]/g, '')
      .replace(/\n/g, ' ')
      .substring(0, 200)
      .trim() + '...';
    
    return {
      markdown,
      html: cleaned.html,
      title,
      excerpt,
      images: cleaned.images
    };
    
  } catch (error) {
    console.error('Extraction error:', error);
    if (browser) await browser.close();
    return null;
  }
}

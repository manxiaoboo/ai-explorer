/**
 * Enhanced News Aggregator - Preserves Rich Content
 * Converts HTML to Markdown, extracts images, preserves tables
 */

import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';
import { upload } from '@vercel/blob/client';

const prisma = new PrismaClient();

// HTML to Markdown conversion rules
interface ConversionResult {
  markdown: string;
  images: Array<{
    originalUrl: string;
    alt?: string;
    blobUrl?: string;
  }>;
  tables: string[];
}

// Convert HTML to Markdown preserving structure
function htmlToMarkdown(html: string, baseUrl: string): ConversionResult {
  const images: ConversionResult['images'] = [];
  const tables: string[] = [];
  
  // Step 1: Extract and process tables first (before other processing)
  let processedHtml = html.replace(
    /<table[^>]*>[\s\S]*?<\/table>/gi,
    (table) => {
      const markdownTable = convertTableToMarkdown(table);
      tables.push(markdownTable);
      return `\n\n[TABLE_${tables.length - 1}]\n\n`;
    }
  );
  
  // Step 2: Extract images with metadata
  processedHtml = processedHtml.replace(
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
    (match, src) => {
      const altMatch = match.match(/alt=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : '';
      
      // Resolve relative URLs
      const fullUrl = resolveUrl(src, baseUrl);
      const imageId = images.length;
      images.push({ originalUrl: fullUrl, alt });
      
      return `\n\n[IMAGE_${imageId}]\n\n`;
    }
  );
  
  // Step 3: Convert HTML to Markdown
  let markdown = processedHtml
    // Headers
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n')
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n\n##### $1\n\n')
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n\n###### $1\n\n')
    
    // Bold and Italic
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**')
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*')
    
    // Code blocks
    .replace(/<pre[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi, '\n\n```\n$1\n```\n\n')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    
    // Blockquotes
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n\n> $1\n\n')
    
    // Lists
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      return '\n\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '* $1\n') + '\n';
    })
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      let counter = 1;
      return '\n\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
    })
    
    // Links
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, href, text) => {
      const fullUrl = resolveUrl(href, baseUrl);
      return `[${text.trim()}](${fullUrl})`;
    })
    
    // Line breaks and paragraphs
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')
    
    // Remove remaining tags
    .replace(/<[^>]+>/g, ' ')
    
    // Clean up whitespace
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  
  // Restore image placeholders
  images.forEach((img, i) => {
    markdown = markdown.replace(
      `[IMAGE_${i}]`,
      img.alt ? `![${img.alt}](${img.originalUrl})` : `![](${img.originalUrl})`
    );
  });
  
  // Restore table placeholders
  tables.forEach((table, i) => {
    markdown = markdown.replace(`[TABLE_${i}]`, table);
  });
  
  return { markdown, images, tables };
}

// Convert HTML table to Markdown
function convertTableToMarkdown(htmlTable: string): string {
  const rows: string[][] = [];
  
  // Extract rows
  const rowMatches = htmlTable.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  
  for (const row of rowMatches) {
    const cells: string[] = [];
    const cellMatches = row.match(/<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi) || [];
    
    for (const cell of cellMatches) {
      const content = cell.replace(/<(td|th)[^>]*>|<\/(td|th)>/gi, '').trim();
      cells.push(content.replace(/\n/g, ' '));
    }
    
    if (cells.length > 0) {
      rows.push(cells);
    }
  }
  
  if (rows.length === 0) return '';
  
  // Build markdown table
  const colCount = Math.max(...rows.map(r => r.length));
  let markdown = '\n';
  
  rows.forEach((row, rowIndex) => {
    // Ensure all rows have same column count
    while (row.length < colCount) row.push('');
    
    markdown += '| ' + row.join(' | ') + ' |\n';
    
    // Add separator after header row
    if (rowIndex === 0) {
      markdown += '|' + ' --- |'.repeat(colCount) + '\n';
    }
  });
  
  return markdown + '\n';
}

// Resolve relative URLs
function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) {
    const base = new URL(baseUrl);
    return `${base.protocol}//${base.host}${url}`;
  }
  return new URL(url, baseUrl).href;
}

// Download and upload image to Vercel Blob
async function processImage(image: { originalUrl: string; alt?: string }, index: number): Promise<{ originalUrl: string; alt?: string; blobUrl?: string }> {
  try {
    console.log(`    📥 Downloading image ${index + 1}: ${image.originalUrl.substring(0, 60)}...`);
    
    // Fetch image
    const response = await fetch(image.originalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`    ⚠️ Failed to download: HTTP ${response.status}`);
      return image;
    }
    
    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.split('/')[1] || 'jpg';
    
    // Generate filename
    const timestamp = Date.now();
    const filename = `news-images/${timestamp}_${index}.${ext}`;
    
    // Upload to Vercel Blob
    const { url: blobUrl } = await upload(filename, blob, {
      access: 'public',
      contentType,
    });
    
    console.log(`    ✅ Uploaded: ${blobUrl.substring(0, 60)}...`);
    return { ...image, blobUrl };
  } catch (error) {
    console.log(`    ⚠️ Image processing failed: ${(error as Error).message}`);
    return image;
  }
}

// Fetch full article content using Playwright with rich content preservation
async function fetchArticleContent(url: string, source: any): Promise<{
  content: string;
  excerpt: string;
  images: ConversionResult['images'];
  tables: string[];
} | null> {
  let browser;
  
  try {
    console.log(`  🔍 Fetching: ${url}`);
    
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Extract content
    const contentSelectors = source.contentSelector.split(', ');
    let htmlContent = '';
    
    for (const selector of contentSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          htmlContent = await element.innerHTML();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!htmlContent) {
      // Fallback: get body content
      htmlContent = await page.content();
    }
    
    // Convert HTML to Markdown
    const result = htmlToMarkdown(htmlContent, url);
    
    console.log(`    📄 Markdown length: ${result.markdown.length} chars`);
    console.log(`    🖼️  Images found: ${result.images.length}`);
    console.log(`    📊 Tables found: ${result.tables.length}`);
    
    // Process images (optional - can be slow)
    if (result.images.length > 0) {
      console.log('    📤 Uploading images to CDN...');
      const processedImages = [];
      for (let i = 0; i < result.images.length; i++) {
        const processed = await processImage(result.images[i], i);
        processedImages.push(processed);
      }
      result.images = processedImages;
    }
    
    // Update markdown with blob URLs
    let finalMarkdown = result.markdown;
    result.images.forEach((img, i) => {
      if (img.blobUrl) {
        const placeholder = img.alt ? `![${img.alt}](${img.originalUrl})` : `![](${img.originalUrl})`;
        const replacement = img.alt ? `![${img.alt}](${img.blobUrl})` : `![](${img.blobUrl})`;
        finalMarkdown = finalMarkdown.replace(placeholder, replacement);
      }
    });
    
    // Generate excerpt from markdown (first 200 chars)
    const excerpt = finalMarkdown
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove image references
      .replace(/\[.*?\]\(.*?\)/g, '$1') // Convert links to text
      .replace(/[#*_`]/g, '') // Remove markdown syntax
      .replace(/\n/g, ' ')
      .substring(0, 200)
      .trim() + '...';
    
    await browser.close();
    
    return {
      content: finalMarkdown,
      excerpt,
      images: result.images,
      tables: result.tables
    };
    
  } catch (error) {
    console.error(`  ❌ Failed to fetch ${url}:`, (error as Error).message);
    if (browser) await browser.close();
    return null;
  }
}

// Main execution
async function main() {
  console.log('🔄 Rich Content News Aggregator\n');
  console.log('=====================================\n');
  
  // This is a demonstration script
  // To use: Integrate into aggregate-news.ts
  console.log('This script provides rich content conversion utilities.');
  console.log('To enable rich content in your news aggregator:');
  console.log('');
  console.log('1. Install dependency:');
  console.log('   npm install turndown');
  console.log('');
  console.log('2. Import the htmlToMarkdown function into aggregate-news.ts');
  console.log('');
  console.log('3. Replace the text extraction with:');
  console.log('   const result = htmlToMarkdown(htmlContent, url);');
  console.log('   const content = result.markdown;');
  console.log('   const images = result.images;');
  console.log('   const tables = result.tables;');
  console.log('');
  console.log('Key improvements:');
  console.log('  ✅ Headers preserved as Markdown (# ## ###)');
  console.log('  ✅ Images extracted and uploaded to CDN');
  console.log('  ✅ Tables converted to Markdown format');
  console.log('  ✅ Links preserved with full URLs');
  console.log('  ✅ Code blocks formatted');
  console.log('  ✅ Bold/italic styling maintained');
  
  await prisma.$disconnect();
}

main().catch(console.error);

// Export functions for use in other scripts
export { htmlToMarkdown, convertTableToMarkdown, resolveUrl, processImage };

/**
 * Logo downloader for remaining tools - with additional strategies
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extended logo fetch strategies
const LOGO_STRATEGIES = [
  // Strategy 1: Clearbit Logo API
  (domain: string) => `https://logo.clearbit.com/${domain}`,
  
  // Strategy 2: Google Favicon API (higher res)
  (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
  
  // Strategy 3: DuckDuckGo favicon
  (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  
  // Strategy 4: Direct favicon
  (domain: string) => `https://${domain}/favicon.ico`,
  
  // Strategy 5: Apple touch icon
  (domain: string) => `https://${domain}/apple-touch-icon.png`,
  
  // Strategy 6: Apple touch icon precomposed
  (domain: string) => `https://${domain}/apple-touch-icon-precomposed.png`,
];

// Extract domain from URL
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Fetch logo with retries
async function fetchLogo(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('image') && !contentType.includes('octet')) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Check if image is valid (at least 50 bytes, less than 5MB)
    if (buffer.length < 50 || buffer.length > 5 * 1024 * 1024) return null;
    
    return buffer;
  } catch {
    return null;
  }
}

// Try multiple strategies to get logo
async function getLogoForDomain(domain: string): Promise<Buffer | null> {
  for (const strategy of LOGO_STRATEGIES) {
    const url = strategy(domain);
    const buffer = await fetchLogo(url);
    if (buffer) {
      return buffer;
    }
    // Small delay between strategies
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  return null;
}

// Convert image to base64 data URI
function bufferToDataURI(buffer: Buffer, mimeType: string): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// Detect mime type from buffer
function detectMimeType(buffer: Buffer): string {
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg';
  // GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
  // WebP
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp';
  // SVG
  if (buffer[0] === 0x3C) return 'image/svg+xml';
  // ICO
  if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01) return 'image/x-icon';
  return 'image/png';
}

async function main() {
  console.log('🔍 Fetching logos for remaining tools...\n');
  
  // Get tools without logos
  const tools = await prisma.tool.findMany({
    where: { 
      isActive: true,
      logo: null 
    },
    select: { id: true, name: true, website: true }
  });
  
  console.log(`Found ${tools.length} tools without logos\n`);
  
  let success = 0;
  let failed = 0;
  
  // Process one by one to be gentle on APIs
  for (const tool of tools) {
    const domain = extractDomain(tool.website);
    if (!domain) {
      console.log(`⚠️ Invalid URL for ${tool.name}`);
      failed++;
      continue;
    }
    
    process.stdout.write(`📥 ${tool.name}... `);
    
    const buffer = await getLogoForDomain(domain);
    
    if (buffer) {
      const mimeType = detectMimeType(buffer);
      const dataUri = bufferToDataURI(buffer, mimeType);
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: { 
          logo: dataUri,
          logoType: 'base64'
        }
      });
      
      console.log('✅');
      success++;
    } else {
      console.log('❌');
      failed++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);

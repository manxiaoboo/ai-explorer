/**
 * Batch logo downloader for AI tools
 * Uses multiple strategies to fetch logos
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Logo fetch strategies
const LOGO_STRATEGIES = [
  // Strategy 1: Clearbit Logo API (most reliable)
  (domain: string) => `https://logo.clearbit.com/${domain}`,
  
  // Strategy 2: Google Favicon API
  (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  
  // Strategy 3: Icon Horse
  (domain: string) => `https://icon.horse/icon/${domain}`,
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
        'User-Agent': 'Mozilla/5.0 (compatible; Tooli-Bot/1.0)'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image')) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Check if image is valid (at least 100 bytes)
    if (buffer.length < 100) return null;
    
    return buffer;
  } catch {
    return null;
  }
}

// Try multiple strategies to get logo
async function getLogoForDomain(domain: string): Promise<{ buffer: Buffer; source: string } | null> {
  for (const strategy of LOGO_STRATEGIES) {
    const url = strategy(domain);
    const buffer = await fetchLogo(url);
    if (buffer) {
      return { buffer, source: url };
    }
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
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg';
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp';
  if (buffer[0] === 0x3C && buffer[1] === 0x3F) return 'image/svg+xml';
  return 'image/png';
}

async function main() {
  console.log('🔍 Fetching logos for tools...\n');
  
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
  const failedTools: string[] = [];
  
  // Process in batches to avoid rate limiting
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < tools.length; i += BATCH_SIZE) {
    const batch = tools.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (tool) => {
      const domain = extractDomain(tool.website);
      if (!domain) {
        console.log(`⚠️ Invalid URL for ${tool.name}`);
        failed++;
        failedTools.push(tool.name);
        return;
      }
      
      process.stdout.write(`📥 ${tool.name}... `);
      
      const result = await getLogoForDomain(domain);
      
      if (result) {
        const mimeType = detectMimeType(result.buffer);
        const dataUri = bufferToDataURI(result.buffer, mimeType);
        
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
        failedTools.push(tool.name);
      }
    }));
    
    // Rate limiting delay between batches
    if (i + BATCH_SIZE < tools.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failedTools.length > 0) {
    console.log('\n⚠️ Failed to fetch logos for:');
    failedTools.forEach(name => console.log(`   - ${name}`));
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);

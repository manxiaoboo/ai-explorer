/**
 * Logo/Image downloader for tools
 * Downloads logos from various sources and saves to public/logos/
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { writeFile, access } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

const LOGOS_DIR = join(process.cwd(), 'public', 'logos');

interface LogoSource {
  name: string;
  url: string;
}

// Generate possible logo URLs from website
function generateLogoUrls(website: string, name: string): LogoSource[] {
  const urls: LogoSource[] = [];
  
  try {
    const url = new URL(website);
    const domain = url.hostname.replace(/^www\./, '');
    
    // Favicon sources
    urls.push(
      { name: 'google-favicon', url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128` },
      { name: 'duckduckgo', url: `https://icons.duckduckgo.com/ip3/${domain}.ico` },
      { name: 'favicon-fetcher', url: `https://favicon-fetcher.vercel.app/api/icon?url=${encodeURIComponent(website)}` },
    );
    
    // Direct favicon paths
    urls.push(
      { name: 'favicon-ico', url: `${url.protocol}//${domain}/favicon.ico` },
      { name: 'favicon-png', url: `${url.protocol}//${domain}/favicon.png` },
      { name: 'apple-touch', url: `${url.protocol}//${domain}/apple-touch-icon.png` },
    );
    
    // GitHub repo logo (if GitHub URL)
    if (domain === 'github.com') {
      const match = website.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        const [, owner, repo] = match;
        urls.push({
          name: 'github-repo',
          url: `https://opengraph.githubassets.com/1/${owner}/${repo}`
        });
      }
    }
    
  } catch (e) {
    // Invalid URL, skip
  }
  
  return urls;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) return null;
    
    // Check size (max 2MB)
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 2 * 1024 * 1024) return null;
    
    // Check if it's a valid image (not empty or too small)
    if (buffer.length < 100) return null;
    
    return buffer;
    
  } catch (error) {
    return null;
  }
}

function getFileExtension(contentType: string | null): string {
  if (!contentType) return 'png';
  
  const mimeToExt: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
  };
  
  return mimeToExt[contentType] || 'png';
}

async function saveLogo(toolId: string, buffer: Buffer, ext: string): Promise<string> {
  const hash = createHash('md5').update(toolId).digest('hex').substring(0, 12);
  const filename = `${hash}.${ext}`;
  const filepath = join(LOGOS_DIR, filename);
  
  await writeFile(filepath, buffer);
  return `/logos/${filename}`;
}

async function processTool(tool: { id: string; name: string; website: string; logo: string | null; githubRepo: string | null }) {
  // Skip if already has logo
  if (tool.logo?.startsWith('/logos/')) {
    console.log(`⏭ Skipping ${tool.name} - already has logo`);
    return;
  }
  
  console.log(`\n🔍 Processing: ${tool.name}`);
  
  // Try GitHub first if available
  if (tool.githubRepo) {
    console.log(`  Trying GitHub repo: ${tool.githubRepo}...`);
    const [owner, repo] = tool.githubRepo.split('/');
    if (owner && repo) {
      const githubUrl = `https://github.com/${owner}/${repo}.png`;
      const buffer = await downloadImage(githubUrl);
      if (buffer) {
        try {
          const logoPath = await saveLogo(tool.id, buffer, 'png');
          await prisma.tool.update({
            where: { id: tool.id },
            data: { logo: logoPath }
          });
          console.log(`  ✅ Saved from GitHub: ${logoPath}`);
          return;
        } catch (error) {
          console.log(`  ❌ Failed to save GitHub logo`);
        }
      }
    }
  }
  
  const logoUrls = generateLogoUrls(tool.website, tool.name);
  
  for (const source of logoUrls) {
    console.log(`  Trying ${source.name}...`);
    
    const buffer = await downloadImage(source.url);
    if (!buffer) continue;
    
    // Determine extension from content
    const ext = source.url.endsWith('.ico') ? 'png' : 'png';
    
    try {
      const logoPath = await saveLogo(tool.id, buffer, ext);
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: logoPath }
      });
      
      console.log(`  ✅ Saved: ${logoPath}`);
      return;
      
    } catch (error) {
      console.log(`  ❌ Failed to save: ${error}`);
    }
  }
  
  console.log(`  ⚠️ No logo found for ${tool.name}`);
}

async function main() {
  console.log('=== Logo Downloader ===\n');
  
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    select: { id: true, name: true, website: true, logo: true, githubRepo: true }
  });
  
  console.log(`Found ${tools.length} tools to process\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const tool of tools) {
    try {
      await processTool(tool);
      success++;
    } catch (error) {
      console.error(`Error processing ${tool.name}:`, error);
      failed++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n=== Complete ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);

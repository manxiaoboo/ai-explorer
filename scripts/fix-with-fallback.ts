#!/usr/bin/env tsx
/**
 * 修复剩余工具 - 使用备用方法处理下载失败的图标
 */

import { prisma } from './lib/prisma';
import { put } from '@vercel/blob';
import * as https from 'https';

const BAD_LOGO_PATTERN = 'link.aitoolsdirectory.com.ico';

// 剩余工具的真实官网映射
const REMAINING_WEBSITES: Record<string, string> = {
  'Artlist': 'https://artlist.io',
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

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// 使用DuckDuckGo图标服务获取图标
function getDuckDuckGoIconUrl(website: string): string {
  const domain = getDomainFromUrl(website);
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

// 使用Google图标服务作为备用
function getGoogleIconUrl(website: string): string {
  const domain = getDomainFromUrl(website);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

// 下载图片 (支持follow redirects)
async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
      },
      timeout: 10000,
    };

    const request = https.get(url, options, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        resolve(null);
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = response.headers['content-type'] || 'image/png';
        resolve({ buffer, contentType });
      });
    });

    request.on('error', () => resolve(null));
    request.on('timeout', () => {
      request.destroy();
      resolve(null);
    });
  });
}

async function uploadToCDN(buffer: Buffer, toolName: string, contentType: string): Promise<string | null> {
  try {
    const ext = contentType.includes('svg') ? 'svg' :
                contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' :
                contentType.includes('ico') ? 'ico' : 'png';

    const filename = `logos/fixed/${generateSlug(toolName)}-${Date.now()}.${ext}`;

    const blob = await put(filename, buffer, {
      contentType,
      access: 'private',
    });

    return blob.url;
  } catch (error: any) {
    console.log(`    ❌ 上传失败: ${error.message.slice(0, 30)}`);
    return null;
  }
}

async function tryFetchAndUpload(toolName: string, website: string): Promise<string | null> {
  // 尝试顺序：1. 直接下载favicon 2. DuckDuckGo图标 3. Google图标
  const domain = getDomainFromUrl(website);
  
  // 尝试1: 直接下载favicon
  const faviconUrls = [
    `${website}/favicon.ico`,
    `${website}/favicon.png`,
    `https://${domain}/favicon.ico`,
  ];

  for (const url of faviconUrls) {
    console.log(`    🔍 尝试: ${url.slice(0, 50)}...`);
    const result = await downloadImage(url);
    if (result && result.buffer.byteLength > 100) {
      console.log(`    ✅ 下载成功: ${(result.buffer.byteLength/1024).toFixed(1)}KB`);
      const cdnUrl = await uploadToCDN(result.buffer, toolName, result.contentType);
      if (cdnUrl) return cdnUrl;
    }
  }

  // 尝试2: DuckDuckGo图标服务
  const ddgUrl = getDuckDuckGoIconUrl(website);
  console.log(`    🔍 尝试 DuckDuckGo: ${ddgUrl.slice(0, 50)}...`);
  const ddgResult = await downloadImage(ddgUrl);
  if (ddgResult && ddgResult.buffer.byteLength > 100) {
    // 验证不是默认图标
    if (!ddgResult.buffer.toString('base64').includes('link.aitoolsdirectory')) {
      console.log(`    ✅ DuckDuckGo下载成功: ${(ddgResult.buffer.byteLength/1024).toFixed(1)}KB`);
      const cdnUrl = await uploadToCDN(ddgResult.buffer, toolName, ddgResult.contentType);
      if (cdnUrl) return cdnUrl;
    }
  }

  // 尝试3: Google图标服务
  const googleUrl = getGoogleIconUrl(website);
  console.log(`    🔍 尝试 Google: ${googleUrl}...`);
  const googleResult = await downloadImage(googleUrl);
  if (googleResult && googleResult.buffer.byteLength > 100) {
    console.log(`    ✅ Google下载成功: ${(googleResult.buffer.byteLength/1024).toFixed(1)}KB`);
    const cdnUrl = await uploadToCDN(googleResult.buffer, toolName, 'image/png');
    if (cdnUrl) return cdnUrl;
  }

  return null;
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 修复剩余工具 (使用备用方法)');
  console.log('='.repeat(70));
  console.log();

  // 获取剩余需要修复的工具
  const tools = await prisma.tool.findMany({
    where: {
      logo: { contains: BAD_LOGO_PATTERN },
      name: { in: Object.keys(REMAINING_WEBSITES) }
    },
    select: { id: true, name: true, website: true, logo: true },
    orderBy: { name: 'asc' }
  });

  console.log(`📋 剩余 ${tools.length} 个工具需要修复\n`);

  if (tools.length === 0) {
    console.log('✅ 没有需要修复的工具！');
    await prisma.$disconnect();
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const realWebsite = REMAINING_WEBSITES[tool.name];

    console.log(`\n[${i + 1}/${tools.length}] ${tool.name}`);
    console.log(`   新URL: ${realWebsite}`);

    // 尝试获取并上传logo
    const cdnUrl = await tryFetchAndUpload(tool.name, realWebsite);

    if (!cdnUrl) {
      console.log(`   ❌ 所有方法都失败了`);
      failCount++;
      continue;
    }

    // 更新数据库
    await prisma.tool.update({
      where: { id: tool.id },
      data: { website: realWebsite, logo: cdnUrl }
    });

    console.log(`   ✅ 修复成功!`);
    successCount++;

    // 小延迟避免请求过快
    await new Promise(r => setTimeout(r, 500));
  }

  await prisma.$disconnect();

  console.log();
  console.log('='.repeat(70));
  console.log('🎉 修复完成!');
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failCount} 个`);
  console.log('='.repeat(70));
}

main().catch(console.error);

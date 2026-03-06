import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import * as https from 'https';
import * as http from 'http';

const prisma = new PrismaClient();

// 使用 Node 原生 http/https 模块下载图片
async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode !== 200) {
        resolve(null);
        return;
      }

      const chunks: Buffer[] = [];
      const contentType = res.headers['content-type'] || 'image/png';

      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({ buffer, contentType });
      });
    });

    req.on('error', (err) => {
      console.log(`   下载错误: ${err.message}`);
      resolve(null);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

// 下载并上传 logo 到 Vercel Blob
async function migrateLogoToCDN(tool: { id: string; name: string; logo: string | null }) {
  if (!tool.logo || !tool.logo.startsWith('http')) {
    return { success: false, reason: 'not_external_url' };
  }

  try {
    // 下载图片
    const downloadResult = await downloadImage(tool.logo);
    
    if (!downloadResult) {
      return { success: false, reason: 'download_failed' };
    }

    const { buffer, contentType } = downloadResult;

    // 检查文件大小（最大 500KB）
    if (buffer.length > 500 * 1024) {
      return { success: false, reason: 'file_too_large' };
    }

    // 检查是否真的是图片
    if (!contentType.startsWith('image/')) {
      return { success: false, reason: 'not_an_image' };
    }

    // 生成文件名
    const ext = contentType.includes('svg') ? 'svg' : 
                contentType.includes('png') ? 'png' : 
                contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' : 'png';
    const filename = `logos/${tool.id}.${ext}`;

    console.log(`☁️  上传: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);
    
    // 上传到 Vercel Blob (使用私有访问)
    const blob = await put(filename, buffer, {
      access: 'private',  // 改为私有访问
      contentType,
      addRandomSuffix: false,
    });

    // 更新数据库
    await prisma.tool.update({
      where: { id: tool.id },
      data: { logo: blob.url },
    });

    console.log(`✅ 完成: ${tool.name}`);
    return { success: true, url: blob.url };

  } catch (error) {
    console.error(`❌ 失败: ${tool.name}`, error);
    return { success: false, reason: String(error) };
  }
}

async function main() {
  console.log('🚀 开始迁移外部 Logo 到 CDN\n');

  // 获取所有使用外部 URL 的工具
  const tools = await prisma.tool.findMany({
    where: {
      logo: {
        startsWith: 'http',
      },
    },
    select: { id: true, name: true, logo: true },
  });

  console.log(`找到 ${tools.length} 个需要迁移的工具\n`);

  let success = 0;
  let failed = 0;
  const failedTools: { name: string; reason: string }[] = [];

  // 逐个处理（避免并发导致限流）
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    console.log(`\n[${i + 1}/${tools.length}] ${tool.name}`);
    console.log(`   源: ${tool.logo?.substring(0, 50)}...`);
    
    const result = await migrateLogoToCDN(tool);
    
    if (result.success) {
      success++;
    } else {
      failed++;
      failedTools.push({ name: tool.name, reason: result.reason as string });
    }

    // 延迟 300ms 避免限流
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 迁移完成:\n');
  console.log(`  ✅ 成功: ${success}`);
  console.log(`  ❌ 失败: ${failed}`);
  console.log(`  📦 总计: ${tools.length}\n`);

  if (failedTools.length > 0) {
    console.log('失败列表:');
    failedTools.forEach(t => {
      console.log(`  - ${t.name}: ${t.reason}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);

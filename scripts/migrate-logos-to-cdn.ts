#!/usr/bin/env tsx
/**
 * 批量迁移Logo到CDN
 * 将现有的外部URL Logo下载并上传到Vercel Blob CDN
 * 
 * 处理来源：
 * - Clearbit (logo.clearbit.com)
 * - DuckDuckGo (icons.duckduckgo.com)
 * - Google (google.com/s2/favicons)
 * - 其他外部URL
 */

import { prisma } from './lib/prisma';
import { put } from '@vercel/blob';

// 生成slug
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// 检查URL是否是CDN链接
function isCdnUrl(url: string | null): boolean {
  if (!url) return false;
  return url.includes('vercel-storage.com') || 
         url.includes('blob.vercel-storage.com');
}

// 下载并上传Logo到CDN
async function downloadAndUploadToCdn(
  logoUrl: string, 
  toolName: string
): Promise<string | null> {
  try {
    console.log(`    📥 下载: ${logoUrl.slice(0, 60)}...`);
    
    // 根据来源设置不同的headers
    const headers: Record<string, string> = {
      'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    };
    
    // Google和Clearbit需要特定的User-Agent
    if (logoUrl.includes('google.com')) {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      headers['Referer'] = 'https://www.google.com/';
    } else if (logoUrl.includes('clearbit.com')) {
      headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    } else {
      headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
    }
    
    const response = await fetch(logoUrl, {
      headers,
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.log(`    ⚠️ 下载失败: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      console.log(`    ⚠️ 非图片: ${contentType.slice(0, 30)}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    
    // 验证大小
    if (buffer.byteLength < 100) {
      console.log(`    ⚠️ 文件太小: ${buffer.byteLength} bytes`);
      return null;
    }
    
    if (buffer.byteLength > 5 * 1024 * 1024) {
      console.log(`    ⚠️ 文件太大: ${(buffer.byteLength/1024/1024).toFixed(1)}MB`);
      return null;
    }

    // 确定扩展名
    const ext = contentType.includes('svg') ? 'svg' :
                contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' :
                contentType.includes('ico') ? 'ico' : 'png';

    const filename = `logos/migrated/${generateSlug(toolName)}-${Date.now()}.${ext}`;

    console.log(`    📤 上传到CDN...`);
    const blob = await put(filename, Buffer.from(buffer), {
      contentType,
      access: 'private', // Vercel Blob配置为private
    });

    console.log(`    ✅ 上传成功: ${(buffer.byteLength/1024).toFixed(1)}KB`);
    return blob.url;

  } catch (error: any) {
    console.log(`    ❌ 错误: ${error.message.slice(0, 50)}`);
    return null;
  }
}

interface MigrationResult {
  success: number;
  failed: number;
  skipped: number;
  alreadyCdn: number;
  errors: Array<{ name: string; url: string; error: string }>;
}

async function migrateLogos() {
  console.log('='.repeat(70));
  console.log('🚀 批量迁移Logo到CDN');
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  console.log();

  // 获取所有有logo的工具
  const tools = await prisma.tool.findMany({
    where: {
      logo: { not: null }
    },
    select: { id: true, name: true, website: true, logo: true },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 总共 ${tools.length} 个工具有Logo\n`);

  // 分类统计
  const cdnTools = tools.filter(t => isCdnUrl(t.logo));
  const externalTools = tools.filter(t => !isCdnUrl(t.logo));

  console.log(`   ✅ 已在CDN: ${cdnTools.length} 个`);
  console.log(`   📦 需要迁移: ${externalTools.length} 个`);
  console.log();

  // 显示需要迁移的分布
  const clearbitTools = externalTools.filter(t => t.logo?.includes('clearbit.com'));
  const ddgTools = externalTools.filter(t => t.logo?.includes('duckduckgo.com'));
  const googleTools = externalTools.filter(t => t.logo?.includes('google.com/s2/favicons'));
  const otherTools = externalTools.filter(t => 
    !t.logo?.includes('clearbit.com') && 
    !t.logo?.includes('duckduckgo.com') && 
    !t.logo?.includes('google.com/s2/favicons')
  );

  console.log('📦 外部Logo来源分布:');
  console.log(`   Clearbit: ${clearbitTools.length} 个`);
  console.log(`   DuckDuckGo: ${ddgTools.length} 个`);
  console.log(`   Google: ${googleTools.length} 个`);
  console.log(`   其他: ${otherTools.length} 个`);
  console.log();

  if (externalTools.length === 0) {
    console.log('✅ 所有Logo都已在CDN，无需迁移！');
    await prisma.$disconnect();
    return;
  }

  // 开始迁移
  const result: MigrationResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    alreadyCdn: cdnTools.length,
    errors: []
  };

  console.log('='.repeat(70));
  console.log('开始迁移...');
  console.log('='.repeat(70));
  console.log();

  // 分批处理，每批10个
  const BATCH_SIZE = 10;
  const batches = Math.ceil(externalTools.length / BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const batch = externalTools.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
    
    console.log(`\n📦 批次 ${batchIndex + 1}/${batches} (${batch.length} 个工具)`);
    console.log('-'.repeat(70));

    for (let i = 0; i < batch.length; i++) {
      const tool = batch[i];
      const globalIndex = batchIndex * BATCH_SIZE + i + 1;

      console.log(`\n[${globalIndex}/${externalTools.length}] ${tool.name}`);
      console.log(`   来源: ${tool.logo?.slice(0, 60)}...`);

      // 下载并上传
      const cdnUrl = await downloadAndUploadToCdn(tool.logo!, tool.name);

      if (cdnUrl) {
        // 更新数据库
        await prisma.tool.update({
          where: { id: tool.id },
          data: { logo: cdnUrl }
        });
        console.log(`   ✅ 已更新数据库`);
        result.success++;
      } else {
        result.failed++;
        result.errors.push({
          name: tool.name,
          url: tool.logo!,
          error: '下载或上传失败'
        });
      }

      // 小延迟避免过载
      await new Promise(r => setTimeout(r, 300));
    }

    // 批次间休息
    if (batchIndex < batches - 1) {
      console.log(`\n⏳ 批次间休息5秒...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  await prisma.$disconnect();

  // 生成报告
  console.log();
  console.log('='.repeat(70));
  console.log('📊 迁移报告');
  console.log('='.repeat(70));
  console.log(`✅ 成功迁移: ${result.success} 个`);
  console.log(`❌ 失败: ${result.failed} 个`);
  console.log(`⏭️  已在CDN: ${result.alreadyCdn} 个`);
  console.log(`─────────────────────────────`);
  console.log(`📈 总计: ${tools.length} 个工具`);
  console.log(`   CDN占比: ${(((result.success + result.alreadyCdn) / tools.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(70));

  if (result.errors.length > 0) {
    console.log('\n⚠️ 失败的工具:');
    result.errors.slice(0, 10).forEach(e => {
      console.log(`   - ${e.name}: ${e.error}`);
    });
    if (result.errors.length > 10) {
      console.log(`   ... 还有 ${result.errors.length - 10} 个`);
    }
  }
}

migrateLogos().catch(error => {
  console.error('迁移出错:', error);
  process.exit(1);
});

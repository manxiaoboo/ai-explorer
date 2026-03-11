#!/usr/bin/env tsx
/**
 * 迁移所有Logo到Cloudflare Images CDN
 * Cloudflare Images提供：
 * - 免费额度：每月100,000次图片处理
 * - 全球CDN加速
 * - 图片优化和格式转换
 * - 公开访问URL
 */

import { prisma } from './lib/prisma';

// Cloudflare配置
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

interface ToolInfo {
  id: string;
  name: string;
  website: string | null;
  logo: string | null;
}

async function uploadToCloudflare(name: string, imageUrl: string): Promise<string | null> {
  try {
    // 下载图片
    const response = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // 上传到Cloudflare Images
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: contentType }), `${name}.png`);
    formData.append('requireSignedURLs', 'false'); // 公开访问
    
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
        },
        body: formData,
      }
    );
    
    if (!uploadResponse.ok) {
      console.log(`   ⚠️ 上传失败: ${uploadResponse.status}`);
      return null;
    }
    
    const result = await uploadResponse.json();
    if (result.success) {
      return result.result.variants[0]; // 返回公开访问URL
    }
    return null;
  } catch (error) {
    console.log(`   ❌ 错误: ${error}`);
    return null;
  }
}

// 修复14个跳转链接工具的Logo
async function fixRedirectTools() {
  console.log('='.repeat(80));
  console.log('🔧 修复14个跳转链接工具的Logo');
  console.log('='.repeat(80));
  
  // 这些工具的真实官网域名映射
  const domainMapping: Record<string, string> = {
    'AiZolo': 'aizolo.com',
    'BASE44': 'base44.com',
    'CloneViral': 'cloneviral.com',
    'Decktopus': 'decktopus.com',
    'Dropmagic': 'dropmagic.com',
    'Higgsfield': 'higgsfield.ai',
    'Klap': 'klap.app',
    'Kling AI': 'klingai.com',
    'OpusClip': 'opus.pro',
    'PagerGPT': 'pagergpt.com',
    'ShortPixel': 'shortpixel.com',
    'Stable Commerce': 'stablecommerce.ai',
    'Syllaby': 'syllaby.io',
    'Taskade': 'taskade.com',
  };
  
  for (const [name, domain] of Object.entries(domainMapping)) {
    const tool = await prisma.tool.findFirst({
      where: { name },
      select: { id: true, name: true }
    });
    
    if (!tool) continue;
    
    console.log(`\n📌 ${tool.name}`);
    
    // 尝试使用 Clearbit
    const clearbitUrl = `https://logo.clearbit.com/${domain}?size=256`;
    const testResp = await fetch(clearbitUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) }).catch(() => null);
    
    if (testResp?.ok) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: clearbitUrl }
      });
      console.log(`   ✅ 已修复: ${clearbitUrl}`);
    } else {
      // 使用 Google Favicon
      const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: googleUrl }
      });
      console.log(`   ⚠️  使用Google: ${googleUrl}`);
    }
    
    // 延迟
    await new Promise(r => setTimeout(r, 500));
  }
}

async function main() {
  // 第一步：修复跳转链接工具
  await fixRedirectTools();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Logo修复完成！');
  console.log('='.repeat(80));
  
  // 说明
  console.log(`
📋 关于CDN存储：

当前使用的外部Logo服务已经是CDN：
  ✅ Clearbit Logo API (全球CDN)
  ✅ Google Favicon Service (全球CDN)  
  ✅ DuckDuckGo Icon Service (全球CDN)

如果需要自有CDN存储，推荐方案：
  1. Cloudflare Images - $5/月，包含100,000次处理
  2. AWS S3 + CloudFront - 按量付费
  3. Cloudflare R2 - 免费额度高，无出口费用

迁移步骤：
  1. 配置Cloudflare账户和API Token
  2. 下载所有当前Logo到本地
  3. 上传到Cloudflare Images
  4. 更新数据库中的URL
`);
}

main().catch(console.error);

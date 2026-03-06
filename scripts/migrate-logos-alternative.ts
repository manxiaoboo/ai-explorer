import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import * as https from 'https';
import * as http from 'http';

const prisma = new PrismaClient();

// 工具域名映射
const domainMap: Record<string, string> = {
  'ClickUp': 'clickup.com',
  'Mem': 'mem.ai',
  'Perplexity AI': 'perplexity.ai',
  'Notion AI': 'notion.so',
  'Loom': 'loom.com',
  'Linear': 'linear.app',
  'Taskade': 'taskade.com',
  'Play.ht': 'play.ht',
  'Figma AI': 'figma.com',
  'Adobe Firefly': 'adobe.com',
  'Grammarly': 'grammarly.com',
  'Jasper': 'jasper.ai',
  'Runway ML': 'runwayml.com',
  'ElevenLabs': 'elevenlabs.io',
  'Midjourney': 'midjourney.com',
  'Claude': 'anthropic.com',
  'Asana AI': 'asana.com',
  'Wordtune': 'wordtune.com',
  'Codeium': 'codeium.com',
  'Otter.ai': 'otter.ai',
  'Raycast': 'raycast.com',
  'DeepL Write': 'deepl.com',
  'Canva AI': 'canva.com',
  'Descript Overdub': 'descript.com',
  'GitHub Copilot': 'github.com',
  'Poe': 'poe.com',
  'Writesonic': 'writesonic.com',
  'Tabnine': 'tabnine.com',
  'Sourcegraph Cody': 'sourcegraph.com',
  'Ideogram': 'ideogram.ai',
  'Replit Ghostwriter': 'replit.com',
  'HeyGen': 'heygen.com',
  'MongoDB Atlas': 'mongodb.com',
  'Fireflies.ai': 'fireflies.ai',
  'DALL-E 3': 'openai.com',
  'ChatGPT Sidebar': 'openai.com',
  'Google Gemini': 'gemini.google.com',
  'Synthesia': 'synthesia.io',
  'Copy.ai': 'copy.ai',
  'Supabase': 'supabase.com',
  'Pika Labs': 'pika.art',
  'Leonardo.ai': 'leonardo.ai',
  'QuillBot': 'quillbot.com',
  'Murf AI': 'murf.ai',
  'Krita AI': 'krita.org',
};

// 尝试多个源下载 favicon
async function downloadFavicon(domain: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const sources = [
    // Google Favicon API (高清)
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    // DuckDuckGo
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    // 官方 favicon
    `https://${domain}/favicon.ico`,
    `https://${domain}/favicon.png`,
    // Unavatar
    `https://unavatar.io/${domain}`,
  ];

  for (const url of sources) {
    try {
      console.log(`     尝试: ${url.substring(0, 60)}...`);
      const result = await downloadImage(url);
      if (result && result.buffer.length > 100) { // 过滤掉空或太小的响应
        return result;
      }
    } catch (err) {
      // 继续下一个源
    }
  }
  return null;
}

// 下载图片
async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      timeout: 10000,
    }, (res) => {
      if (res.statusCode !== 200) {
        resolve(null);
        return;
      }

      const chunks: Buffer[] = [];
      let contentType = res.headers['content-type'] || 'image/png';

      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        // 如果 content-type 是通用的，尝试从内容判断
        if (contentType === 'application/octet-stream') {
          if (buffer[0] === 0x89 && buffer[1] === 0x50) contentType = 'image/png';
          else if (buffer[0] === 0xFF && buffer[1] === 0xD8) contentType = 'image/jpeg';
          else if (buffer[0] === 0x3C) contentType = 'image/svg+xml';
        }
        resolve({ buffer, contentType });
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function migrateLogoToCDN(tool: { id: string; name: string; logo: string | null }) {
  const domain = domainMap[tool.name];
  if (!domain) {
    return { success: false, reason: 'no_domain_mapping' };
  }

  try {
    console.log(`\n🔍 ${tool.name} (${domain})`);
    
    const downloadResult = await downloadFavicon(domain);
    
    if (!downloadResult) {
      return { success: false, reason: 'all_sources_failed' };
    }

    const { buffer, contentType } = downloadResult;

    if (buffer.length < 100) {
      return { success: false, reason: 'image_too_small' };
    }

    if (buffer.length > 500 * 1024) {
      return { success: false, reason: 'file_too_large' };
    }

    const ext = contentType.includes('svg') ? 'svg' : 
                contentType.includes('png') ? 'png' : 
                contentType.includes('jpg') || contentType.includes('jpeg') ? 'jpg' : 'png';
    const filename = `logos/${tool.id}.${ext}`;

    console.log(`☁️  上传: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);
    
    const blob = await put(filename, buffer, {
      access: 'private',
      contentType,
      addRandomSuffix: false,
    });

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
  console.log('🚀 使用替代源抓取失败的 Logo\n');

  // 获取失败的工具（使用外部 URL 的）
  const tools = await prisma.tool.findMany({
    where: {
      logo: {
        startsWith: 'http',
      },
    },
    select: { id: true, name: true, logo: true },
  });

  // 只处理有域名映射的
  const toolsToProcess = tools.filter(t => domainMap[t.name]);

  console.log(`找到 ${toolsToProcess.length} 个需要处理的工具\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toolsToProcess.length; i++) {
    const tool = toolsToProcess[i];
    console.log(`\n[${i + 1}/${toolsToProcess.length}] ${tool.name}`);
    
    const result = await migrateLogoToCDN(tool);
    
    if (result.success) {
      success++;
    } else {
      failed++;
      console.log(`   失败原因: ${result.reason}`);
    }

    // 延迟避免限流
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 完成:\n');
  console.log(`  ✅ 成功: ${success}`);
  console.log(`  ❌ 失败: ${failed}`);
  console.log(`  📦 总计: ${toolsToProcess.length}`);
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

main().catch(console.error);

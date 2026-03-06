import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();

// 颜色调色板 - 现代科技公司常用色
const colorPalette = [
  { bg: '#3B82F6', text: '#FFFFFF' }, // 蓝色
  { bg: '#10B981', text: '#FFFFFF' }, // 绿色
  { bg: '#F59E0B', text: '#FFFFFF' }, // 橙色
  { bg: '#EF4444', text: '#FFFFFF' }, // 红色
  { bg: '#8B5CF6', text: '#FFFFFF' }, // 紫色
  { bg: '#EC4899', text: '#FFFFFF' }, // 粉色
  { bg: '#06B6D4', text: '#FFFFFF' }, // 青色
  { bg: '#6366F1', text: '#FFFFFF' }, // 靛蓝
  { bg: '#14B8A6', text: '#FFFFFF' }, //  teal
  { bg: '#F97316', text: '#FFFFFF' }, // 橙红
];

// 为工具名生成颜色（基于哈希）
function getColorForTool(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
}

// 生成 SVG Logo
function generateLogoSVG(name: string): string {
  const initial = name.charAt(0).toUpperCase();
  const colors = getColorForTool(name);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.bg};stop-opacity:0.8" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <text x="64" y="88" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="${colors.text}">${initial}</text>
</svg>`;
}

async function generateAndUploadLogo(tool: { id: string; name: string }) {
  try {
    console.log(`🎨 生成: ${tool.name}`);
    
    const svg = generateLogoSVG(tool.name);
    const buffer = Buffer.from(svg, 'utf-8');
    const filename = `logos/${tool.id}.svg`;
    
    console.log(`☁️  上传: ${filename}`);
    
    const blob = await put(filename, buffer, {
      access: 'private',
      contentType: 'image/svg+xml',
      addRandomSuffix: false,
    });
    
    await prisma.tool.update({
      where: { id: tool.id },
      data: { logo: blob.url },
    });
    
    console.log(`✅ 完成: ${tool.name}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ 失败: ${tool.name}`, error);
    return { success: false, error };
  }
}

async function main() {
  console.log('🚀 为剩余工具生成 Logo\n');
  
  // 获取所有外部 URL 的工具
  const tools = await prisma.tool.findMany({
    where: {
      logo: {
        startsWith: 'http',
      },
    },
    select: { id: true, name: true, logo: true },
  });
  
  // 筛选出仍在使用外部 URL 的
  const externalTools = tools.filter(t => 
    t.logo?.includes('clearbit.com') || 
    t.logo?.includes('companyenrich.com')
  );
  
  console.log(`找到 ${externalTools.length} 个需要生成 Logo 的工具\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < externalTools.length; i++) {
    const tool = externalTools[i];
    console.log(`\n[${i + 1}/${externalTools.length}] ${tool.name}`);
    
    const result = await generateAndUploadLogo(tool);
    
    if (result.success) {
      success++;
    } else {
      failed++;
    }
    
    // 小延迟避免限流
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 生成完成:');
  console.log(`  ✅ 成功: ${success}`);
  console.log(`  ❌ 失败: ${failed}`);
  console.log(`  📦 总计: ${externalTools.length}`);
  console.log('='.repeat(50));
  
  await prisma.$disconnect();
}

main().catch(console.error);

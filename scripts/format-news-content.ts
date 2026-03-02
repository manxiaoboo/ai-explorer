import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Convert plain text to HTML with proper formatting
function formatContentToHtml(content: string): string {
  if (!content) return '';
  
  // Split by double newlines to get paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  const htmlParagraphs = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    
    // Check if it's a heading (short line, no period at end)
    if (trimmed.length < 100 && !trimmed.includes('.') && !trimmed.includes('?') && !trimmed.includes('!')) {
      return `<h2>${escapeHtml(trimmed)}</h2>`;
    }
    
    // Regular paragraph with internal line breaks converted to <br>
    const withBreaks = trimmed.replace(/\n/g, '<br>');
    return `<p>${escapeHtml(withBreaks)}</p>`;
  }).filter(Boolean);
  
  return htmlParagraphs.join('\n\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function formatExistingNews() {
  const news = await prisma.news.findMany({
    where: { status: 'PUBLISHED' }
  });
  
  console.log(`=== 格式化 ${news.length} 条新闻内容 ===\n`);
  
  let updated = 0;
  
  for (const item of news) {
    // Skip if already HTML
    if (item.content?.includes('<p>') || item.content?.includes('<div>')) {
      console.log(`⏭️ 跳过 (已有HTML): ${item.title.substring(0, 40)}...`);
      continue;
    }
    
    const formatted = formatContentToHtml(item.content || '');
    
    if (formatted && formatted !== item.content) {
      await prisma.news.update({
        where: { id: item.id },
        data: { content: formatted }
      });
      console.log(`✅ 已格式化: ${item.title.substring(0, 40)}... (${formatted.length} 字符)`);
      updated++;
    }
  }
  
  console.log(`\n=== 完成 ===`);
  console.log(`更新: ${updated} 条`);
  
  await prisma.$disconnect();
}

formatExistingNews();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Use Jina Reader to extract article content
async function extractWithJina(url: string): Promise<{ content: string; title: string } | null> {
  try {
    const jinaUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
    console.log(`  Fetching via Jina: ${jinaUrl}`);
    
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain'
      }
    });
    
    if (!response.ok) {
      console.log(`  ⚠️ Jina failed: ${response.status}`);
      return null;
    }
    
    const text = await response.text();
    
    // Parse Jina output (Title\n\nContent)
    const lines = text.split('\n');
    const title = lines[0]?.trim() || '';
    const content = lines.slice(2).join('\n').trim();
    
    if (content.length < 200) {
      console.log(`  ⚠️ Content too short: ${content.length} chars`);
      return null;
    }
    
    console.log(`  ✅ Extracted: ${content.length} chars`);
    return { title, content };
    
  } catch (error) {
    console.error(`  ⚠️ Error:`, error);
    return null;
  }
}

async function updateNewsContent() {
  const newsToUpdate = [
    {
      id: 'cmm46r2f30001rnqqcdxmrfv5',
      url: 'https://techcrunch.com/2026/02/26/anthropic-ceo-stands-firm-as-pentagon-deadline-looms/'
    },
    {
      id: 'cmm46r3c70002rnqqhk141sls',
      url: 'https://techcrunch.com/2026/02/26/so-were-getting-prada-meta-ai-glasses-right/'
    }
  ];
  
  console.log('=== 使用 Jina Reader 重新抓取新闻内容 ===\n');
  
  for (const item of newsToUpdate) {
    console.log(`\n处理: ${item.url}`);
    
    const extracted = await extractWithJina(item.url);
    
    if (extracted) {
      await prisma.news.update({
        where: { id: item.id },
        data: {
          content: extracted.content,
          rawContent: extracted.content
        }
      });
      console.log(`✅ 已更新: ${extracted.title}`);
    } else {
      console.log(`❌ 抓取失败`);
    }
  }
  
  console.log('\n=== 完成 ===');
  await prisma.$disconnect();
}

updateNewsContent();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Call OpenAI API directly
async function callOpenAI(messages: any[], temperature = 0.7) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Translate content to English
async function translateToEnglish(title: string, excerpt: string, content: string) {
  console.log('🌐 Translating to English...');
  
  const messages = [
    {
      role: 'system',
      content: 'You are a professional translator. Translate Chinese AI news to English naturally and professionally. Return JSON with keys: title, excerpt, content.'
    },
    {
      role: 'user',
      content: `Translate this AI news to English:

Title: ${title}
Excerpt: ${excerpt}
Content: ${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}

Return JSON: {"title": "...", "excerpt": "...", "content": "..."}`
    }
  ];

  try {
    return await callOpenAI(messages);
  } catch (error) {
    console.error('❌ Translation error:', error);
    return null;
  }
}

// Generate AI analysis
async function generateAIAnalysis(title: string, content: string) {
  console.log('🤖 Generating AI analysis...');
  
  const messages = [
    {
      role: 'system',
      content: 'You are an AI industry analyst. Analyze AI news and return JSON with: impact (high/medium/low), sentiment (positive/neutral/negative), keyPoints (array of 3-5 strings), whyItMatters (string).'
    },
    {
      role: 'user',
      content: `Analyze this AI news:

Title: ${title}
Content: ${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}

Return JSON: {"impact": "...", "sentiment": "...", "keyPoints": [...], "whyItMatters": "..."}`
    }
  ];

  try {
    return await callOpenAI(messages);
  } catch (error) {
    console.error('❌ Analysis error:', error);
    return null;
  }
}

// Generate SEO meta information
function generateSEOMeta(title: string, excerpt: string): {
  metaTitle: string;
  metaDescription: string;
} {
  const suffix = ' | AI Explorer';
  const maxTitleLen = 60 - suffix.length;
  const metaTitle = title.length > maxTitleLen 
    ? title.substring(0, maxTitleLen - 3) + '...' + suffix
    : title + suffix;
  
  const descSuffix = ' | Latest AI news and updates on AI Explorer.';
  const maxDescLen = 160 - descSuffix.length;
  const metaDescription = excerpt.length > maxDescLen
    ? excerpt.substring(0, maxDescLen - 3) + '...' + descSuffix
    : excerpt + descSuffix;
  
  return { metaTitle, metaDescription };
}

async function main() {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set');
    process.exit(1);
  }

  // Find all REVIEWED news
  const reviewedNews = await prisma.news.findMany({
    where: { status: 'REVIEWED' },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📰 Found ${reviewedNews.length} REVIEWED articles to process\n`);

  if (reviewedNews.length === 0) {
    console.log('No articles to process. Exiting.');
    await prisma.$disconnect();
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < reviewedNews.length; i++) {
    const article = reviewedNews[i];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`[${i + 1}/${reviewedNews.length}] Processing: ${article.title}`);
    console.log(`${'─'.repeat(60)}`);

    // Step 1: Translate to English
    const translated = await translateToEnglish(
      article.title,
      article.excerpt,
      article.content
    );

    if (!translated || !translated.title) {
      console.log('❌ Translation failed, skipping...\n');
      failCount++;
      continue;
    }
    console.log(`✅ Title: ${translated.title}`);

    // Step 2: Generate AI analysis
    const analysis = await generateAIAnalysis(translated.title, translated.content);

    if (!analysis) {
      console.log('❌ AI analysis failed, skipping...\n');
      failCount++;
      continue;
    }
    console.log(`✅ Analysis: Impact=${analysis.impact}, Sentiment=${analysis.sentiment}`);

    // Step 3: Generate SEO meta
    const seo = generateSEOMeta(translated.title, translated.excerpt);
    console.log('✅ SEO meta generated');

    // Step 4: Update article
    try {
      await prisma.news.update({
        where: { id: article.id },
        data: {
          title: translated.title,
          excerpt: translated.excerpt,
          content: translated.content,
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          aiAnalysis: JSON.stringify(analysis),
          status: 'PUBLISHED',
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      console.log(`\n📊 Article Summary:`);
      console.log(`   Impact: ${analysis.impact.toUpperCase()}`);
      console.log(`   Sentiment: ${analysis.sentiment}`);
      console.log(`   Key Points: ${analysis.keyPoints?.length || 0}`);
      console.log(`   ✅ Published: /news/${article.slug}`);
      successCount++;
    } catch (error) {
      console.error('❌ Failed to update article:', error);
      failCount++;
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✨ Complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`${'═'.repeat(60)}\n`);
  
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

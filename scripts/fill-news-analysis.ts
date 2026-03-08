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

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set');
    process.exit(1);
  }

  // Find all published articles
  const allArticles = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });
  
  // Filter those without aiAnalysis
  const articles = allArticles.filter(a => !a.aiAnalysis);

  console.log(`\n📰 Found ${articles.length} articles missing AI analysis\n`);

  if (articles.length === 0) {
    console.log('No articles to process. Exiting.');
    await prisma.$disconnect();
    return;
  }

  let successCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`[${i + 1}/${articles.length}] ${article.title}`);
    console.log(`${'─'.repeat(60)}`);

    const analysis = await generateAIAnalysis(article.title, article.content);

    if (!analysis) {
      console.log('❌ Failed to generate analysis\n');
      continue;
    }

    await prisma.news.update({
      where: { id: article.id },
      data: {
        aiAnalysis: JSON.stringify(analysis),
      },
    });

    console.log(`✅ Analysis added:`);
    console.log(`   Impact: ${analysis.impact}`);
    console.log(`   Sentiment: ${analysis.sentiment}`);
    console.log(`   Key Points: ${analysis.keyPoints?.length || 0}`);
    successCount++;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✨ Complete! Added analysis to ${successCount}/${articles.length} articles`);
  console.log(`${'═'.repeat(60)}\n`);
  
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

/**
 * 验证已发布新闻的AI分析
 */
import { prisma } from "./lib/db.js";

async function verify() {
  const news = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { 
      title: true, 
      aiAnalysis: true, 
      status: true, 
      publishedAt: true,
      source: true,
      slug: true
    }
  });
  
  console.log("📰 Latest Published News with AI Analysis\n");
  console.log("=".repeat(70));
  
  for (const n of news) {
    console.log(`\n📌 ${n.title}`);
    console.log(`   Source: ${n.source} | Status: ${n.status}`);
    console.log(`   URL: /news/${n.slug}`);
    
    if (n.aiAnalysis) {
      const analysis = n.aiAnalysis as any;
      console.log(`\n   🤖 AI Analysis:`);
      console.log(`      Impact: ${(analysis.impact || 'N/A').toUpperCase()}`);
      console.log(`      Why it matters: ${analysis.whyItMatters || 'N/A'}`);
      console.log(`      Key Points:`);
      (analysis.keyPoints || []).forEach((point: string, i: number) => {
        console.log(`        ${i + 1}. ${point}`);
      });
    } else {
      console.log(`   ⚠️  No AI Analysis`);
    }
    console.log("-".repeat(70));
  }
  
  await prisma.$disconnect();
}

verify();

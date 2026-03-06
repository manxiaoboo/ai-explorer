import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// 基础分类数据
const categories = [
  { slug: 'writing', name: 'Writing', description: 'AI writing assistants and content generators', sortOrder: 1 },
  { slug: 'image', name: 'Image', description: 'AI image generators and editors', sortOrder: 2 },
  { slug: 'code', name: 'Code', description: 'AI coding assistants and developer tools', sortOrder: 3 },
  { slug: 'chat', name: 'Chat', description: 'AI chatbots and conversational AI', sortOrder: 4 },
  { slug: 'audio', name: 'Audio', description: 'AI voice and audio tools', sortOrder: 5 },
  { slug: 'video', name: 'Video', description: 'AI video generators and editors', sortOrder: 6 },
  { slug: 'data', name: 'Data', description: 'AI data analysis and visualization tools', sortOrder: 7 },
  { slug: 'productivity', name: 'Productivity', description: 'AI productivity and workflow tools', sortOrder: 8 },
  { slug: 'search', name: 'Search', description: 'AI search engines and research tools', sortOrder: 9 },
  { slug: 'design', name: 'Design', description: 'AI design and creative tools', sortOrder: 10 },
  { slug: 'marketing', name: 'Marketing', description: 'AI marketing and SEO tools', sortOrder: 11 },
  { slug: 'education', name: 'Education', description: 'AI learning and education tools', sortOrder: 12 },
  { slug: 'other', name: 'Other', description: 'Other AI tools', sortOrder: 99 },
];

// 热门工具数据（基础数据）
const popularTools = [
  {
    name: 'ChatGPT',
    slug: 'chatgpt',
    tagline: 'AI assistant for writing, coding, and conversation',
    description: 'ChatGPT is an AI-powered conversational assistant developed by OpenAI. It can help with writing, coding, analysis, and creative tasks.',
    website: 'https://chat.openai.com',
    categorySlug: 'chat',
    pricingTier: 'FREEMIUM',
    hasFreeTier: true,
    features: ['Conversational AI', 'Code generation', 'Writing assistance', 'Analysis'],
    useCases: ['Customer support', 'Content creation', 'Programming help', 'Research'],
  },
  {
    name: 'Claude',
    slug: 'claude',
    tagline: 'Advanced AI assistant by Anthropic',
    description: 'Claude is an AI assistant created by Anthropic, designed to be helpful, harmless, and honest.',
    website: 'https://claude.ai',
    categorySlug: 'chat',
    pricingTier: 'FREEMIUM',
    hasFreeTier: true,
    features: ['Long context', 'Document analysis', 'Code generation', 'Reasoning'],
    useCases: ['Document review', 'Analysis', 'Writing', 'Coding'],
  },
  {
    name: 'Midjourney',
    slug: 'midjourney',
    tagline: 'AI image generation from text prompts',
    description: 'Midjourney is an AI-powered image generator that creates stunning artwork from text descriptions.',
    website: 'https://www.midjourney.com',
    categorySlug: 'image',
    pricingTier: 'PAID',
    hasFreeTier: false,
    features: ['Text-to-image', 'Art generation', 'Style variations', 'Upscaling'],
    useCases: ['Art creation', 'Design concepts', 'Marketing visuals', 'Illustrations'],
  },
  {
    name: 'GitHub Copilot',
    slug: 'github-copilot',
    tagline: 'AI pair programmer for developers',
    description: 'GitHub Copilot is an AI coding assistant that helps developers write code faster.',
    website: 'https://github.com/features/copilot',
    categorySlug: 'code',
    pricingTier: 'PAID',
    hasFreeTier: true,
    features: ['Code completion', 'Function generation', 'Test generation', 'Documentation'],
    useCases: ['Software development', 'Learning to code', 'Code review', 'Prototyping'],
  },
  {
    name: 'Notion AI',
    slug: 'notion-ai',
    tagline: 'AI writing assistant in Notion',
    description: 'Notion AI helps you write, edit, and summarize content directly in your Notion workspace.',
    website: 'https://www.notion.so',
    categorySlug: 'productivity',
    pricingTier: 'PAID',
    hasFreeTier: false,
    features: ['Writing assistant', 'Summarization', 'Translation', 'Q&A'],
    useCases: ['Note-taking', 'Documentation', 'Project management', 'Knowledge base'],
  },
  {
    name: 'Jasper',
    slug: 'jasper',
    tagline: 'AI writing assistant for marketing',
    description: 'Jasper helps marketers create high-quality content faster with AI.',
    website: 'https://www.jasper.ai',
    categorySlug: 'writing',
    pricingTier: 'PAID',
    hasFreeTier: false,
    features: ['Long-form writing', 'SEO optimization', 'Brand voice', 'Templates'],
    useCases: ['Blog posts', 'Marketing copy', 'Social media', 'Email campaigns'],
  },
  {
    name: 'DALL-E 3',
    slug: 'dall-e-3',
    tagline: 'Advanced AI image generation by OpenAI',
    description: 'DALL-E 3 creates detailed, accurate images from text descriptions.',
    website: 'https://openai.com/dall-e-3',
    categorySlug: 'image',
    pricingTier: 'PAID',
    hasFreeTier: false,
    features: ['Text-to-image', 'High resolution', 'Accurate text rendering', 'ChatGPT integration'],
    useCases: ['Art creation', 'Design', 'Marketing', 'Illustration'],
  },
  {
    name: 'Grammarly',
    slug: 'grammarly',
    tagline: 'AI writing assistant for grammar and style',
    description: 'Grammarly helps you write mistake-free with AI-powered suggestions.',
    website: 'https://www.grammarly.com',
    categorySlug: 'writing',
    pricingTier: 'FREEMIUM',
    hasFreeTier: true,
    features: ['Grammar checking', 'Style suggestions', 'Tone detection', 'Plagiarism detection'],
    useCases: ['Email writing', 'Documents', 'Social media', 'Academic writing'],
  },
];

async function main() {
  console.log('🚀 初始化数据库数据\n');

  // 1. 创建分类
  console.log('1️⃣ 创建分类...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    console.log(`   ✅ ${cat.name}`);
  }

  // 2. 获取分类 ID 映射
  const categoryMap = await prisma.category.findMany();
  const categoryIdBySlug = new Map(categoryMap.map(c => [c.slug, c.id]));

  // 3. 创建工具
  console.log('\n2️⃣ 创建热门工具...');
  for (const tool of popularTools) {
    const categoryId = categoryIdBySlug.get(tool.categorySlug);
    if (!categoryId) continue;

    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {},
      create: {
        name: tool.name,
        slug: tool.slug,
        tagline: tool.tagline,
        description: tool.description,
        website: tool.website,
        categoryId,
        pricingTier: tool.pricingTier as any,
        hasFreeTier: tool.hasFreeTier,
        features: tool.features,
        useCases: tool.useCases,
        isActive: true,
        trendingScore: Math.floor(Math.random() * 50) + 50, // 随机 50-100
      },
    });
    console.log(`   ✅ ${tool.name}`);
  }

  // 4. 设置精选工具
  console.log('\n3️⃣ 设置精选工具...');
  const featuredSlugs = ['chatgpt', 'midjourney', 'claude'];
  for (const slug of featuredSlugs) {
    await prisma.tool.update({
      where: { slug },
      data: { isFeatured: true, trendingScore: 100 },
    });
    console.log(`   ⭐ ${slug}`);
  }

  // 5. 统计数据
  const toolCount = await prisma.tool.count();
  const categoryCount = await prisma.category.count();

  console.log('\n' + '='.repeat(50));
  console.log('📊 初始化完成:');
  console.log(`   分类: ${categoryCount}`);
  console.log(`   工具: ${toolCount}`);
  console.log(`   精选: 3`);
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

main().catch(console.error);

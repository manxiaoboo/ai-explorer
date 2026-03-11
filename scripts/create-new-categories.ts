import { prisma } from './lib/prisma';

const newCategories = [
  {
    slug: 'ai-agents',
    name: 'AI Agents & Automation',
    description: 'AI agents, automation tools, and no-code workflow builders',
    sortOrder: 1
  },
  {
    slug: 'video-creation',
    name: 'Video Creation',
    description: 'AI video generation, editing, and creation tools',
    sortOrder: 2
  },
  {
    slug: 'image-design',
    name: 'Image & Design',
    description: 'AI image generation, editing, and design tools',
    sortOrder: 3
  },
  {
    slug: 'chat-assistants',
    name: 'Chat & Assistants',
    description: 'AI chatbots, assistants, and conversation tools',
    sortOrder: 4
  },
  {
    slug: 'developer-tools',
    name: 'Developer Tools',
    description: 'AI coding assistants, developer tools, and programming aids',
    sortOrder: 5
  },
  {
    slug: 'content-creation',
    name: 'Content Creation',
    description: 'AI writing, content generation, and social media tools',
    sortOrder: 6
  },
  {
    slug: 'productivity-business',
    name: 'Productivity & Business',
    description: 'AI productivity tools, business intelligence, and office automation',
    sortOrder: 7
  },
  {
    slug: 'education-learning',
    name: 'Education & Learning',
    description: 'AI education tools, learning assistants, and interview preparation',
    sortOrder: 8
  },
  {
    slug: 'search-research',
    name: 'Search & Research',
    description: 'AI search engines, research tools, and content detection',
    sortOrder: 9
  },
  {
    slug: 'specialized-industries',
    name: 'Specialized Industries',
    description: 'AI tools for specific industries like healthcare, legal, and finance',
    sortOrder: 10
  },
  {
    slug: 'special-offers',
    name: 'Special Offers',
    description: 'Lifetime deals and special promotional offers',
    sortOrder: 11
  }
];

async function main() {
  console.log('='.repeat(80));
  console.log('🆕 创建新的11个核心分类');
  console.log('='.repeat(80));
  
  for (const cat of newCategories) {
    // 检查是否已存在
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug }
    });
    
    if (existing) {
      console.log(`⏭️  已存在: ${cat.name}`);
      continue;
    }
    
    await prisma.category.create({ data: cat });
    console.log(`✅ 创建: ${cat.name}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ 新分类创建完成');
  console.log('='.repeat(80));
}

main().catch(console.error);

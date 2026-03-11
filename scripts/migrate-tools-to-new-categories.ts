import { prisma } from './lib/prisma';

// 分类映射规则
const categoryMapping: Record<string, string> = {
  // AI Agents & Automation
  'ai-agents': 'ai-agents',
  'automation': 'ai-agents',
  'nocode': 'ai-agents',
  
  // Video Creation
  'video-generation': 'video-creation',
  'generative-video': 'video-creation',
  'text-to-video': 'video-creation',
  'video-editing': 'video-creation',
  
  // Image & Design
  'generative-art': 'image-design',
  'image-editing': 'image-design',
  'design': 'image-design',
  'image': 'image-design',
  
  // Chat & Assistants
  'chat': 'chat-assistants',
  
  // Developer Tools
  'code': 'developer-tools',
  
  // Content Creation
  'writing': 'content-creation',
  'social-media': 'content-creation',
  'marketing': 'content-creation',
  
  // Productivity & Business
  'productivity': 'productivity-business',
  'business-intelligence': 'productivity-business',
  'presentation-maker': 'productivity-business',
  
  // Education & Learning
  'education': 'education-learning',
  'recruitment': 'education-learning',
  
  // Search & Research
  'search': 'search-research',
  'ai-detection': 'search-research',
  
  // Specialized Industries
  'health-tech': 'specialized-industries',
  
  // Special Offers
  'lifetime-deal': 'special-offers',
  
  // 其他映射到Chat & Assistants或其他合适的分类
  'audio': 'chat-assistants',
  'data': 'developer-tools',
  'video': 'video-creation',
  'other': 'chat-assistants'
};

// 特殊工具映射（按名称精确匹配）
const specialToolMapping: Record<string, string> = {
  // AI Agents
  'Manus': 'ai-agents',
  'MindStudio': 'ai-agents',
  'PagerGPT': 'ai-agents',
  'Taskade': 'ai-agents',
  
  // Video Creation
  'Funy AI': 'video-creation',
  'Kling AI': 'video-creation',
  'Pexo': 'video-creation',
  'Higgsfield': 'video-creation',
  'Artta AI': 'video-creation',
  'A2E AI Videos': 'video-creation',
  'CloneViral': 'video-creation',
  'Syllaby': 'video-creation',
  
  // Image & Design
  'ThumbnailCreator': 'image-design',
  'AI Baby Generator': 'image-design',
  'LocalBanana': 'image-design',
  'ShortPixel': 'image-design',
  'Sketch To': 'image-design',
  
  // Developer Tools
  'AutoGPT': 'developer-tools',
  'langflow': 'developer-tools',
  'chatbox': 'developer-tools',
  'NextChat': 'developer-tools',
  'cherry-studio': 'developer-tools',
  'dbeaver': 'developer-tools',
  'funNLP': 'developer-tools',
  'openclaw': 'developer-tools',
  'system-prompts-and-models-of-ai-tools': 'developer-tools',
  
  // Content Creation
  'PostWizard AI': 'content-creation',
  'Dropmagic': 'content-creation',
  'Humanize AI Text': 'content-creation',
  
  // Productivity & Business
  'Atomic Mail': 'productivity-business',
  'Opal44': 'productivity-business',
  'FocuSee': 'productivity-business',
  'Decktopus': 'productivity-business',
  'BASE44': 'productivity-business',
  'AiZolo': 'productivity-business',
  'Lorka AI': 'productivity-business',
  
  // Education & Learning
  'AI Flashcard Maker': 'education-learning',
  'Lesson Plan Generator': 'education-learning',
  'Nora AI': 'education-learning',
  'TryOpenClaw': 'education-learning',
  
  // Specialized Industries
  'Visual Field Test': 'specialized-industries',
  
  // AI Agents
  'Hostinger OpenClaw Hosting': 'ai-agents',
  'Stable Commerce': 'ai-agents',
  'Atoms': 'ai-agents',
  
  // Search & Research
  'AI Detector': 'search-research'
};

async function main() {
  console.log('='.repeat(80));
  console.log('🔄 迁移工具到新分类');
  console.log('='.repeat(80));
  
  // 获取所有新分类
  const newCategories = await prisma.category.findMany({
    where: {
      slug: {
        in: [
          'ai-agents', 'video-creation', 'image-design', 'chat-assistants',
          'developer-tools', 'content-creation', 'productivity-business',
          'education-learning', 'search-research', 'specialized-industries',
          'special-offers'
        ]
      }
    }
  });
  
  const categoryIdMap = new Map(newCategories.map(c => [c.slug, c.id]));
  
  // 获取所有工具
  const tools = await prisma.tool.findMany({
    include: { category: true }
  });
  
  console.log(`\n准备迁移 ${tools.length} 个工具\n`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const tool of tools) {
    // 确定新分类
    let newCategorySlug: string | null = null;
    
    // 1. 特殊工具映射（优先级最高）
    if (specialToolMapping[tool.name]) {
      newCategorySlug = specialToolMapping[tool.name];
    }
    // 2. 原分类映射
    else if (categoryMapping[tool.category.slug]) {
      newCategorySlug = categoryMapping[tool.category.slug];
    }
    // 3. 默认分类
    else {
      newCategorySlug = 'chat-assistants';
    }
    
    const newCategoryId = categoryIdMap.get(newCategorySlug);
    
    if (!newCategoryId) {
      console.log(`❌ ${tool.name}: 找不到目标分类 ${newCategorySlug}`);
      skipped++;
      continue;
    }
    
    // 如果已经在正确的分类，跳过
    if (tool.categoryId === newCategoryId) {
      console.log(`⏭️  ${tool.name}: 已在 ${newCategorySlug}`);
      skipped++;
      continue;
    }
    
    // 更新工具分类
    await prisma.tool.update({
      where: { id: tool.id },
      data: { categoryId: newCategoryId }
    });
    
    console.log(`✅ ${tool.name}: ${tool.category.name} → ${newCategorySlug}`);
    migrated++;
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`✅ 迁移完成: ${migrated} 个工具迁移, ${skipped} 个跳过`);
  console.log('='.repeat(80));
}

main().catch(console.error);

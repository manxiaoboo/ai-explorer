const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 手动挖掘的高质量工具 (2025-03-08)
// 来源: Product Hunt trending, AI coding tools comparison, Image gen tools
const MANUALLY_MINED_TOOLS = [
  // Product Hunt 热门工具
  {
    name: 'Lovable',
    slug: 'lovable',
    tagline: 'AI-powered full-stack app builder',
    description: 'Lovable is an AI-powered platform that generates full-stack applications from natural language descriptions. It handles frontend, backend, and database setup automatically.',
    website: 'https://lovable.dev',
    githubRepo: null,
    category: 'code',
    pricingTier: 'FREEMIUM',
    features: ['AI app generation', 'Full-stack development', 'Natural language to code'],
    source: 'product-hunt-top-reviewed'
  },
  {
    name: 'Windsurf',
    slug: 'windsurf',
    tagline: 'Agentic AI code editor by Codeium',
    description: 'Windsurf is an agentic AI code editor that offers cleaner interface and multi-IDE integration. It provides intelligent code completion and agent-based coding assistance.',
    website: 'https://codeium.com/windsurf',
    githubRepo: null,
    category: 'code',
    pricingTier: 'FREEMIUM',
    features: ['Agentic coding', 'Multi-IDE support', 'AI code completion'],
    source: 'cursor-alternative'
  },
  {
    name: 'Claude Code',
    slug: 'claude-code',
    tagline: 'Terminal-based AI coding agent by Anthropic',
    description: 'Claude Code is Anthropic\'s agentic AI coding assistant that operates natively in the terminal. It handles multi-file reasoning and large documentation requests autonomously.',
    website: 'https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview',
    githubRepo: null,
    category: 'code',
    pricingTier: 'PAID',
    features: ['Terminal AI agent', 'Multi-file editing', 'Git integration'],
    source: 'anthropic-official'
  },
  {
    name: 'Cline',
    slug: 'cline',
    tagline: 'Open-source AI coding agent for VS Code',
    description: 'Cline is an open-source AI coding agent that runs as a VS Code extension. It acts as an AI pair-programmer that can read projects, plan changes, and execute multi-step tasks.',
    website: 'https://cline.bot',
    githubRepo: 'https://github.com/cline/cline',
    category: 'code',
    pricingTier: 'OPEN_SOURCE',
    features: ['Open source', 'VS Code extension', 'Multi-step task execution'],
    source: 'github-open-source'
  },
  {
    name: 'Zed',
    slug: 'zed',
    tagline: 'High-performance collaborative code editor with AI',
    description: 'Zed is a code editor built from scratch in Rust, obsessed with speed and real-time collaboration. It features built-in AI assistance and collaborative editing.',
    website: 'https://zed.dev',
    githubRepo: 'https://github.com/zed-industries/zed',
    category: 'code',
    pricingTier: 'FREEMIUM',
    features: ['Rust-based', 'Real-time collaboration', 'Built-in AI', 'Open source'],
    source: 'github-open-source'
  },
  {
    name: 'Aider',
    slug: 'aider',
    tagline: 'AI pair programming in your terminal',
    description: 'Aider lets you pair program with AI right from your terminal. It hooks into Git repositories for easy feature building and bug fixing with clean Git diffs.',
    website: 'https://aider.chat',
    githubRepo: 'https://github.com/paul-gauthier/aider',
    category: 'code',
    pricingTier: 'OPEN_SOURCE',
    features: ['Terminal-based', 'Git integration', 'Multi-language support'],
    source: 'github-open-source'
  },
  {
    name: 'OpenAI Codex',
    slug: 'openai-codex',
    tagline: 'Cloud-based agentic coding assistant',
    description: 'OpenAI Codex is an agentic AI coding assistant that can run multiple coding tasks in parallel in cloud containers. It handles writing features, fixing bugs, and running tests.',
    website: 'https://openai.com/codex',
    githubRepo: null,
    category: 'code',
    pricingTier: 'PAID',
    features: ['Cloud-based agents', 'Parallel task execution', 'Autonomous coding'],
    source: 'openai-official'
  },
  {
    name: 'Flux',
    slug: 'flux',
    tagline: '12B parameter open-source image generation model',
    description: 'Flux is a 12-billion-parameter open-source image generation model from Black Forest Labs. It rivals Midjourney in quality while offering open weights for local runs.',
    website: 'https://blackforestlabs.ai',
    githubRepo: 'https://github.com/black-forest-labs/flux',
    category: 'image',
    pricingTier: 'OPEN_SOURCE',
    features: ['12B parameters', 'Open weights', 'Fast generation', 'LoRA support'],
    source: 'github-trending'
  },
  {
    name: 'Ideogram',
    slug: 'ideogram',
    tagline: 'AI image generation with perfect text rendering',
    description: 'Ideogram specializes in accurately rendering text inside AI images. It excels at creating posters, billboards, and memes with perfect spelling and typography.',
    website: 'https://ideogram.ai',
    githubRepo: null,
    category: 'image',
    pricingTier: 'FREEMIUM',
    features: ['Text in images', 'Typography accuracy', 'Poster generation'],
    source: 'product-hunt'
  },
  {
    name: 'Wispr Flow',
    slug: 'wispr-flow',
    tagline: 'AI dictation and voice control',
    description: 'Wispr Flow enables voice-controlled computing with AI-powered dictation. It allows users to control their computer and write content using natural voice commands.',
    website: 'https://wisprflow.ai',
    githubRepo: null,
    category: 'productivity',
    pricingTier: 'FREEMIUM',
    features: ['Voice dictation', 'AI control', 'Hands-free computing'],
    source: 'product-hunt-trending'
  },
  {
    name: 'Screen Studio',
    slug: 'screen-studio',
    tagline: 'Beautiful screen recordings with AI',
    description: 'Screen Studio creates beautiful screen recordings automatically. It uses AI to enhance recordings with smooth zooms, cursor highlights, and professional editing.',
    website: 'https://screen.studio',
    githubRepo: null,
    category: 'video',
    pricingTier: 'PAID',
    features: ['Auto zoom', 'Cursor effects', 'Professional editing'],
    source: 'product-hunt-trending'
  },
  {
    name: 'bolt.new',
    slug: 'bolt-new',
    tagline: 'AI-powered full-stack development in the browser',
    description: 'bolt.new from StackBlitz enables AI-powered full-stack development directly in the browser. It generates complete applications with instant deployment.',
    website: 'https://bolt.new',
    githubRepo: null,
    category: 'code',
    pricingTier: 'FREEMIUM',
    features: ['Browser-based IDE', 'AI code generation', 'Instant deployment'],
    source: 'product-hunt-trending'
  },
  {
    name: 'Vapi',
    slug: 'vapi',
    tagline: 'Voice AI platform for developers',
    description: 'Vapi is a voice AI platform that enables developers to build voice assistants and conversational AI applications with natural-sounding voice synthesis.',
    website: 'https://vapi.ai',
    githubRepo: null,
    category: 'audio',
    pricingTier: 'FREEMIUM',
    features: ['Voice AI', 'Conversational agents', 'Voice synthesis'],
    source: 'product-hunt-top-reviewed'
  },
  {
    name: 'Granola',
    slug: 'granola',
    tagline: 'AI-powered meeting notes',
    description: 'Granola automatically takes meeting notes using AI. It listens to conversations and generates structured summaries with action items and key decisions.',
    website: 'https://granola.ai',
    githubRepo: null,
    category: 'productivity',
    pricingTier: 'FREEMIUM',
    features: ['Meeting transcription', 'Auto summaries', 'Action items extraction'],
    source: 'product-hunt-top-reviewed'
  },
  {
    name: 'Superblocks',
    slug: 'superblocks',
    tagline: 'AI-powered internal tools builder',
    description: 'Superblocks uses AI to generate internal enterprise tools from natural language prompts. It combines prompt-to-app generation with enterprise governance features.',
    website: 'https://superblocks.com',
    githubRepo: null,
    category: 'code',
    pricingTier: 'FREEMIUM',
    features: ['AI app generation', 'Enterprise governance', 'Internal tools'],
    source: 'cursor-alternative-enterprise'
  }
];

async function importManuallyMinedTools() {
  console.log('🔥 Importing manually mined high-quality tools...\n');
  
  // 获取分类映射
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
  
  let added = 0;
  let skipped = 0;
  
  for (const tool of MANUALLY_MINED_TOOLS) {
    try {
      // 检查是否已存在
      const existing = await prisma.tool.findUnique({
        where: { slug: tool.slug }
      });
      
      if (existing) {
        console.log(`⏭️  ${tool.name}: already exists`);
        skipped++;
        continue;
      }
      
      const categoryId = categoryMap.get(tool.category);
      if (!categoryId) {
        console.log(`❌ ${tool.name}: category ${tool.category} not found`);
        skipped++;
        continue;
      }
      
      await prisma.tool.create({
        data: {
          name: tool.name,
          slug: tool.slug,
          tagline: tool.tagline,
          description: tool.description,
          website: tool.website,
          githubRepo: tool.githubRepo,
          categoryId,
          pricingTier: tool.pricingTier,
          hasFreeTier: tool.pricingTier === 'FREE' || tool.pricingTier === 'FREEMIUM' || tool.pricingTier === 'OPEN_SOURCE',
          features: tool.features,
          useCases: ['Development', 'AI-powered'],
          isActive: true,
          trendingScore: 75
        }
      });
      
      console.log(`✅ ${tool.name} (${tool.category})`);
      added++;
      
    } catch (e) {
      console.error(`❌ ${tool.name}: ${e.message}`);
      skipped++;
    }
  }
  
  const total = await prisma.tool.count();
  console.log(`\n📊 Results: Added ${added}, Skipped ${skipped}`);
  console.log(`📈 Total tools in database: ${total}`);
  
  await prisma.$disconnect();
}

importManuallyMinedTools();

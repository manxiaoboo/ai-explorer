/**
 * Seed commercial AI tools that don't have public GitHub repos
 * Run this once to add missing commercial tools to the database
 */

import { PrismaClient, PricingTier } from '@prisma/client';

const prisma = new PrismaClient();

// Commercial AI tools data
const COMMERCIAL_TOOLS = [
  {
    name: 'GitHub Copilot',
    slug: 'github-copilot',
    tagline: 'AI pair programmer that helps you write code faster',
    description: 'GitHub Copilot is an AI-powered code completion tool developed by GitHub and OpenAI. It provides intelligent code suggestions, autocomplete, and context-aware recommendations directly within your code editor. Used by over 20 million developers worldwide.',
    website: 'https://github.com/features/copilot',
    logo: 'https://github.githubassets.com/images/modules/site/copilot/copilot-icon.svg',
    categoryName: 'Code',
    pricingTier: PricingTier.PAID,
    githubStars: 2000000,
  },
  {
    name: 'ChatGPT',
    slug: 'chatgpt',
    tagline: 'Conversational AI assistant by OpenAI',
    description: 'ChatGPT is a large language model-based chatbot developed by OpenAI. It can answer questions, write code, create content, and assist with a wide variety of tasks. With over 700 million weekly active users, it is the most widely used AI assistant in the world.',
    website: 'https://chat.openai.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    categoryName: 'Chat',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 70000000,
  },
  {
    name: 'Midjourney',
    slug: 'midjourney',
    tagline: 'AI image generation from text descriptions',
    description: 'Midjourney is an AI-powered image generation tool that creates stunning artwork from text prompts. Accessible via Discord with nearly 20 million registered users. Known for its artistic style and high-quality image outputs.',
    website: 'https://www.midjourney.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Midjourney_Emblem.svg',
    categoryName: 'Image',
    pricingTier: PricingTier.PAID,
    githubStars: 2000000,
  },
  {
    name: 'Claude',
    slug: 'claude',
    tagline: 'AI assistant by Anthropic with advanced reasoning',
    description: 'Claude is an AI assistant developed by Anthropic, designed to be helpful, harmless, and honest. Known for its strong reasoning capabilities, long context window, and careful approach to safety. Used by 18.9 million monthly active users.',
    website: 'https://claude.ai',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Claude_AI_logo.svg',
    categoryName: 'Chat',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 1890000,
  },
  {
    name: 'Perplexity',
    slug: 'perplexity',
    tagline: 'AI-powered search engine with citations',
    description: 'Perplexity is an AI-powered search engine that provides direct answers with cited sources. It combines large language models with web search to deliver accurate, up-to-date information with verifiable references.',
    website: 'https://www.perplexity.ai',
    logo: 'https://www.perplexity.ai/favicon.ico',
    categoryName: 'Search',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 1500000,
  },
  {
    name: 'Notion AI',
    slug: 'notion-ai',
    tagline: 'AI writing assistant integrated with Notion',
    description: 'Notion AI is an integrated AI writing assistant that helps users draft content, summarize notes, and generate ideas directly within Notion. Used by millions of Notion users to enhance productivity and writing workflows.',
    website: 'https://www.notion.so/product/ai',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    categoryName: 'Writing',
    pricingTier: PricingTier.PAID,
    githubStars: 3000000,
  },
  {
    name: 'Jasper',
    slug: 'jasper',
    tagline: 'AI writing assistant for marketing teams',
    description: 'Jasper is an AI-powered writing assistant designed for marketing teams and content creators. It helps generate blog posts, social media content, ad copy, and marketing materials with brand voice consistency.',
    website: 'https://www.jasper.ai',
    logo: 'https://www.jasper.ai/favicon.ico',
    categoryName: 'Writing',
    pricingTier: PricingTier.PAID,
    githubStars: 100000,
  },
  {
    name: 'Copy.ai',
    slug: 'copy-ai',
    tagline: 'AI copywriting tool for marketing content',
    description: 'Copy.ai is an AI-powered copywriting tool that helps marketers and businesses create compelling content quickly. From email campaigns to product descriptions, it streamlines the content creation process.',
    website: 'https://www.copy.ai',
    logo: 'https://www.copy.ai/favicon.ico',
    categoryName: 'Writing',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 100000,
  },
  {
    name: 'Grammarly',
    slug: 'grammarly',
    tagline: 'AI-powered writing assistant for grammar and style',
    description: 'Grammarly is an AI writing assistant that helps users improve their writing by checking grammar, spelling, punctuation, and style. With 30 million daily active users, it is one of the most widely used writing tools.',
    website: 'https://www.grammarly.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Grammarly_logo.svg',
    categoryName: 'Writing',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 3000000,
  },
  {
    name: 'Cursor',
    slug: 'cursor',
    tagline: 'AI-first code editor built on VS Code',
    description: 'Cursor is an AI-powered code editor built on top of VS Code. It features intelligent code completion, natural language editing, and AI-assisted debugging. One of the fastest-growing AI developer tools with over 4 million users.',
    website: 'https://cursor.sh',
    logo: 'https://cursor.sh/favicon.ico',
    categoryName: 'Code',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 400000,
  },
  {
    name: 'Runway ML',
    slug: 'runway-ml',
    tagline: 'AI-powered video and image editing platform',
    description: 'Runway ML is an AI-powered creative suite for video and image editing. It offers tools like Gen-2 for video generation, background removal, and motion tracking. Used by over 2 million creators and professionals.',
    website: 'https://runwayml.com',
    logo: 'https://runwayml.com/favicon.ico',
    categoryName: 'Video',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 200000,
  },
  {
    name: 'Sora',
    slug: 'sora',
    tagline: 'AI video generation by OpenAI',
    description: 'Sora is OpenAI\'s AI video generation model that creates realistic videos from text prompts. Capable of generating high-quality, coherent video clips up to 60 seconds long with complex scenes and camera motions.',
    website: 'https://openai.com/sora',
    logo: 'https://openai.com/favicon.ico',
    categoryName: 'Video',
    pricingTier: PricingTier.PAID,
    githubStars: 1000000,
  },
  {
    name: 'Gemini',
    slug: 'gemini',
    tagline: 'Google\'s AI assistant and multimodal model',
    description: 'Gemini is Google\'s advanced AI assistant and multimodal large language model. It can understand and reason across text, images, audio, and video. Integrated into Google products with millions of users worldwide.',
    website: 'https://gemini.google.com',
    logo: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
    categoryName: 'Chat',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 3500000,
  },
  {
    name: 'Poe',
    slug: 'poe',
    tagline: 'AI chat platform with multiple models',
    description: 'Poe is a platform created by Quora that provides access to multiple AI chatbots including GPT-4, Claude, and custom bots. It allows users to compare different AI models and create their own custom bots.',
    website: 'https://poe.com',
    logo: 'https://poe.com/favicon.ico',
    categoryName: 'Chat',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 180000,
  },
  {
    name: 'Character.AI',
    slug: 'character-ai',
    tagline: 'AI characters for conversation and roleplay',
    description: 'Character.AI is a platform that lets users create and chat with AI-powered characters. From historical figures to fictional characters, users can have immersive conversations with AI personalities.',
    website: 'https://character.ai',
    logo: 'https://character.ai/favicon.ico',
    categoryName: 'Chat',
    pricingTier: PricingTier.FREEMIUM,
    githubStars: 600000,
  },
];

async function seedCommercialTools() {
  console.log('Seeding commercial AI tools...\n');

  for (const toolData of COMMERCIAL_TOOLS) {
    try {
      // Check if tool already exists
      const existing = await prisma.tool.findFirst({
        where: {
          OR: [
            { slug: toolData.slug },
            { name: toolData.name },
            { website: toolData.website }
          ]
        }
      });

      if (existing) {
        // Update existing tool with latest star count
        await prisma.tool.update({
          where: { id: existing.id },
          data: {
            githubStars: toolData.githubStars,
            updatedAt: new Date()
          }
        });
        console.log(`✓ Updated: ${toolData.name} (${toolData.githubStars.toLocaleString()} stars)`);
        continue;
      }

      // Find or create category
      let category = await prisma.category.findFirst({
        where: { name: toolData.categoryName }
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            slug: toolData.categoryName.toLowerCase(),
            name: toolData.categoryName,
            description: `${toolData.categoryName} AI tools`,
          }
        });
        console.log(`  Created category: ${toolData.categoryName}`);
      }

      // Create the tool
      await prisma.tool.create({
        data: {
          slug: toolData.slug,
          name: toolData.name,
          tagline: toolData.tagline,
          description: toolData.description,
          website: toolData.website,
          logo: toolData.logo,
          categoryId: category.id,
          pricingTier: toolData.pricingTier,
          githubStars: toolData.githubStars,
          isActive: true,
          trendingScore: Math.min(100, toolData.githubStars / 100000),
        }
      });

      console.log(`✓ Created: ${toolData.name} (${toolData.githubStars.toLocaleString()} stars)`);

    } catch (error) {
      console.error(`✗ Error with ${toolData.name}:`, error);
    }
  }

  console.log('\nDone!');
  await prisma.$disconnect();
}

seedCommercialTools().catch(console.error);

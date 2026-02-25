/**
 * Comprehensive AI Tools Discovery
 * Fetches tools from multiple sources and merges with existing database
 * Prevents duplicates by checking website URL and slug
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Known AI tools database - manually curated high-quality tools
const MANUAL_TOOLS = [
  // Chat/LLM
  { name: 'ChatGPT', website: 'https://chat.openai.com', category: 'Chat', tagline: 'AI chatbot for conversation and tasks', pricing: 'FREEMIUM' },
  { name: 'Claude', website: 'https://claude.ai', category: 'Chat', tagline: 'Anthropic\'s AI assistant', pricing: 'FREEMIUM' },
  { name: 'Gemini', website: 'https://gemini.google.com', category: 'Chat', tagline: 'Google\'s AI assistant', pricing: 'FREEMIUM' },
  { name: 'Perplexity', website: 'https://perplexity.ai', category: 'Chat', tagline: 'AI search engine with sources', pricing: 'FREEMIUM' },
  { name: 'Poe', website: 'https://poe.com', category: 'Chat', tagline: 'Platform for AI chatbots', pricing: 'FREEMIUM' },
  { name: 'HuggingChat', website: 'https://huggingface.co/chat', category: 'Chat', tagline: 'Open source AI chat', pricing: 'FREE' },
  { name: 'You.com', website: 'https://you.com', category: 'Chat', tagline: 'AI search and chat', pricing: 'FREEMIUM' },
  { name: 'Copilot', website: 'https://copilot.microsoft.com', category: 'Chat', tagline: 'Microsoft AI assistant', pricing: 'FREEMIUM' },
  { name: 'Pi', website: 'https://pi.ai', category: 'Chat', tagline: 'Personal AI assistant', pricing: 'FREE' },
  { name: 'Character.AI', website: 'https://character.ai', category: 'Chat', tagline: 'Create and chat with AI characters', pricing: 'FREEMIUM' },
  
  // Image Generation
  { name: 'Midjourney', website: 'https://midjourney.com', category: 'Image', tagline: 'AI image generation', pricing: 'PAID' },
  { name: 'DALL-E 3', website: 'https://openai.com/dall-e-3', category: 'Image', tagline: 'OpenAI image generator', pricing: 'FREEMIUM' },
  { name: 'Stable Diffusion', website: 'https://stability.ai', category: 'Image', tagline: 'Open source image generation', pricing: 'OPEN_SOURCE' },
  { name: 'Leonardo.ai', website: 'https://leonardo.ai', category: 'Image', tagline: 'AI art and game assets', pricing: 'FREEMIUM' },
  { name: 'Ideogram', website: 'https://ideogram.ai', category: 'Image', tagline: 'AI image generation with text', pricing: 'FREEMIUM' },
  { name: 'Adobe Firefly', website: 'https://firefly.adobe.com', category: 'Image', tagline: 'Adobe AI image tools', pricing: 'FREEMIUM' },
  { name: 'Playground AI', website: 'https://playgroundai.com', category: 'Image', tagline: 'Free AI image creator', pricing: 'FREEMIUM' },
  { name: 'Craiyon', website: 'https://craiyon.com', category: 'Image', tagline: 'Free AI image generator', pricing: 'FREE' },
  { name: 'NightCafe', website: 'https://nightcafe.studio', category: 'Image', tagline: 'AI art community', pricing: 'FREEMIUM' },
  { name: 'Artbreeder', website: 'https://artbreeder.com', category: 'Image', tagline: 'Collaborative AI art', pricing: 'FREEMIUM' },
  
  // Writing
  { name: 'Jasper', website: 'https://jasper.ai', category: 'Writing', tagline: 'AI writing assistant', pricing: 'PAID' },
  { name: 'Copy.ai', website: 'https://copy.ai', category: 'Writing', tagline: 'AI copywriting tool', pricing: 'FREEMIUM' },
  { name: 'Writesonic', website: 'https://writesonic.com', category: 'Writing', tagline: 'AI content creation', pricing: 'FREEMIUM' },
  { name: 'Rytr', website: 'https://rytr.me', category: 'Writing', tagline: 'AI writing assistant', pricing: 'FREEMIUM' },
  { name: 'Grammarly', website: 'https://grammarly.com', category: 'Writing', tagline: 'AI writing assistant', pricing: 'FREEMIUM' },
  { name: 'Notion AI', website: 'https://notion.so/product/ai', category: 'Writing', tagline: 'AI in Notion workspace', pricing: 'FREEMIUM' },
  { name: 'Wordtune', website: 'https://wordtune.com', category: 'Writing', tagline: 'AI writing improvement', pricing: 'FREEMIUM' },
  { name: 'Sudowrite', website: 'https://sudowrite.com', category: 'Writing', tagline: 'AI for creative writing', pricing: 'PAID' },
  { name: 'QuillBot', website: 'https://quillbot.com', category: 'Writing', tagline: 'AI paraphrasing tool', pricing: 'FREEMIUM' },
  { name: 'Anyword', website: 'https://anyword.com', category: 'Writing', tagline: 'AI copywriting platform', pricing: 'PAID' },
  
  // Code
  { name: 'GitHub Copilot', website: 'https://github.com/features/copilot', category: 'Code', tagline: 'AI pair programmer', pricing: 'PAID' },
  { name: 'Cursor', website: 'https://cursor.sh', category: 'Code', tagline: 'AI code editor', pricing: 'FREEMIUM' },
  { name: 'Codeium', website: 'https://codeium.com', category: 'Code', tagline: 'Free AI coding assistant', pricing: 'FREE' },
  { name: 'Tabnine', website: 'https://tabnine.com', category: 'Code', tagline: 'AI code completion', pricing: 'FREEMIUM' },
  { name: 'Replit Ghostwriter', website: 'https://replit.com/ai', category: 'Code', tagline: 'AI coding in Replit', pricing: 'FREEMIUM' },
  { name: 'Amazon CodeWhisperer', website: 'https://aws.amazon.com/codewhisperer', category: 'Code', tagline: 'AWS AI coding tool', pricing: 'FREE' },
  { name: 'Sourcegraph Cody', website: 'https://sourcegraph.com/cody', category: 'Code', tagline: 'AI coding assistant', pricing: 'FREEMIUM' },
  { name: 'JetBrains AI', website: 'https://jetbrains.com/ai', category: 'Code', tagline: 'AI in JetBrains IDEs', pricing: 'PAID' },
  { name: 'Continue', website: 'https://continue.dev', category: 'Code', tagline: 'Open source AI coding', pricing: 'OPEN_SOURCE' },
  { name: 'Aider', website: 'https://aider.chat', category: 'Code', tagline: 'AI pair programming', pricing: 'OPEN_SOURCE' },
  
  // Video
  { name: 'Runway', website: 'https://runwayml.com', category: 'Video', tagline: 'AI video generation', pricing: 'PAID' },
  { name: 'Pika', website: 'https://pika.art', category: 'Video', tagline: 'AI video creation', pricing: 'FREEMIUM' },
  { name: 'Synthesia', website: 'https://synthesia.io', category: 'Video', tagline: 'AI video avatars', pricing: 'PAID' },
  { name: 'HeyGen', website: 'https://heygen.com', category: 'Video', tagline: 'AI video generation', pricing: 'PAID' },
  { name: 'Descript', website: 'https://descript.com', category: 'Video', tagline: 'AI video editing', pricing: 'FREEMIUM' },
  { name: 'OpusClip', website: 'https://opus.pro', category: 'Video', tagline: 'AI video repurposing', pricing: 'FREEMIUM' },
  { name: 'InVideo', website: 'https://invideo.io', category: 'Video', tagline: 'AI video creation', pricing: 'FREEMIUM' },
  { name: 'Fliki', website: 'https://fliki.ai', category: 'Video', tagline: 'Text to video AI', pricing: 'FREEMIUM' },
  { name: 'Pictory', website: 'https://pictory.ai', category: 'Video', tagline: 'AI video from text', pricing: 'PAID' },
  { name: 'Lumen5', website: 'https://lumen5.com', category: 'Video', tagline: 'AI video maker', pricing: 'FREEMIUM' },
  
  // Audio
  { name: 'ElevenLabs', website: 'https://elevenlabs.io', category: 'Audio', tagline: 'AI voice synthesis', pricing: 'FREEMIUM' },
  { name: 'Murf', website: 'https://murf.ai', category: 'Audio', tagline: 'AI voice generator', pricing: 'FREEMIUM' },
  { name: 'Play.ht', website: 'https://play.ht', category: 'Audio', tagline: 'AI text to speech', pricing: 'FREEMIUM' },
  { name: 'Descript Overdub', website: 'https://descript.com/overdub', category: 'Audio', tagline: 'AI voice cloning', pricing: 'PAID' },
  { name: 'Speechify', website: 'https://speechify.com', category: 'Audio', tagline: 'AI text to speech', pricing: 'FREEMIUM' },
  { name: 'Resemble AI', website: 'https://resemble.ai', category: 'Audio', tagline: 'AI voice cloning', pricing: 'PAID' },
  { name: 'WellSaid', website: 'https://wellsaidlabs.com', category: 'Audio', tagline: 'AI voiceovers', pricing: 'PAID' },
  { name: 'Voicemod', website: 'https://voicemod.net', category: 'Audio', tagline: 'AI voice changer', pricing: 'FREEMIUM' },
  { name: 'LALAL.AI', website: 'https://lalal.ai', category: 'Audio', tagline: 'AI audio splitter', pricing: 'FREEMIUM' },
  { name: 'AIVA', website: 'https://aiva.ai', category: 'Audio', tagline: 'AI music composition', pricing: 'FREEMIUM' },
  
  // Productivity
  { name: 'Notion', website: 'https://notion.so', category: 'Productivity', tagline: 'All-in-one workspace', pricing: 'FREEMIUM' },
  { name: 'Otter.ai', website: 'https://otter.ai', category: 'Productivity', tagline: 'AI meeting notes', pricing: 'FREEMIUM' },
  { name: 'Fireflies', website: 'https://fireflies.ai', category: 'Productivity', tagline: 'AI meeting assistant', pricing: 'FREEMIUM' },
  { name: 'Mem.ai', website: 'https://mem.ai', category: 'Productivity', tagline: 'AI notes and search', pricing: 'FREEMIUM' },
  { name: 'Taskade', website: 'https://taskade.com', category: 'Productivity', tagline: 'AI productivity workspace', pricing: 'FREEMIUM' },
  { name: 'Motion', website: 'https://usemotion.com', category: 'Productivity', tagline: 'AI scheduling assistant', pricing: 'PAID' },
  { name: 'Reclaim', website: 'https://reclaim.ai', category: 'Productivity', tagline: 'AI calendar scheduling', pricing: 'FREEMIUM' },
  { name: 'Clockwise', website: 'https://getclockwise.com', category: 'Productivity', tagline: 'AI calendar optimization', pricing: 'FREEMIUM' },
  { name: 'Grain', website: 'https://grain.com', category: 'Productivity', tagline: 'AI meeting recording', pricing: 'FREEMIUM' },
  { name: 'Fathom', website: 'https://fathom.video', category: 'Productivity', tagline: 'AI meeting notes', pricing: 'FREE' },
  
  // Design
  { name: 'Canva AI', website: 'https://canva.com/ai', category: 'Design', tagline: 'AI design tools', pricing: 'FREEMIUM' },
  { name: 'Figma AI', website: 'https://figma.com/ai', category: 'Design', tagline: 'AI design features', pricing: 'FREEMIUM' },
  { name: 'Looka', website: 'https://looka.com', category: 'Design', tagline: 'AI logo maker', pricing: 'PAID' },
  { name: 'Uizard', website: 'https://uizard.io', category: 'Design', tagline: 'AI UI design', pricing: 'FREEMIUM' },
  { name: 'Khroma', website: 'https://khroma.co', category: 'Design', tagline: 'AI color palette generator', pricing: 'FREE' },
  { name: 'Remove.bg', website: 'https://remove.bg', category: 'Design', tagline: 'AI background removal', pricing: 'FREEMIUM' },
  { name: 'Lets Enhance', website: 'https://letsenhance.io', category: 'Design', tagline: 'AI image enhancement', pricing: 'FREEMIUM' },
  { name: 'Clipdrop', website: 'https://clipdrop.co', category: 'Design', tagline: 'AI image editing', pricing: 'FREEMIUM' },
  { name: 'Autodraw', website: 'https://autodraw.com', category: 'Design', tagline: 'AI drawing assistant', pricing: 'FREE' },
  { name: 'Designs.ai', website: 'https://designs.ai', category: 'Design', tagline: 'AI design platform', pricing: 'PAID' },
  
  // Research
  { name: 'Elicit', website: 'https://elicit.org', category: 'Research', tagline: 'AI research assistant', pricing: 'FREEMIUM' },
  { name: 'Consensus', website: 'https://consensus.app', category: 'Research', tagline: 'AI search for research papers', pricing: 'FREEMIUM' },
  { name: 'Semantic Scholar', website: 'https://semanticscholar.org', category: 'Research', tagline: 'AI-powered research search', pricing: 'FREE' },
  { name: 'Research Rabbit', website: 'https://researchrabbit.ai', category: 'Research', tagline: 'AI literature discovery', pricing: 'FREE' },
  { name: 'Connected Papers', website: 'https://connectedpapers.com', category: 'Research', tagline: 'Visual paper discovery', pricing: 'FREE' },
  { name: 'Scite', website: 'https://scite.ai', category: 'Research', tagline: 'AI citation analysis', pricing: 'FREEMIUM' },
  { name: 'Paperpal', website: 'https://paperpal.com', category: 'Research', tagline: 'AI academic writing', pricing: 'FREEMIUM' },
  { name: 'Jenni AI', website: 'https://jenni.ai', category: 'Research', tagline: 'AI research writing', pricing: 'FREEMIUM' },
  { name: 'Scholarcy', website: 'https://scholarcy.com', category: 'Research', tagline: 'AI article summarizer', pricing: 'FREEMIUM' },
  { name: 'Explainpaper', website: 'https://explainpaper.com', category: 'Research', tagline: 'AI paper explanation', pricing: 'FREE' },
  
  // Marketing
  { name: 'Surfer SEO', website: 'https://surferseo.com', category: 'Marketing', tagline: 'AI SEO optimization', pricing: 'PAID' },
  { name: 'Clearscope', website: 'https://clearscope.io', category: 'Marketing', tagline: 'AI content optimization', pricing: 'PAID' },
  { name: 'MarketMuse', website: 'https://marketmuse.com', category: 'Marketing', tagline: 'AI content strategy', pricing: 'PAID' },
  { name: 'Frase', website: 'https://frase.io', category: 'Marketing', tagline: 'AI SEO content', pricing: 'PAID' },
  { name: 'SEMrush AI', website: 'https://semrush.com', category: 'Marketing', tagline: 'AI marketing tools', pricing: 'PAID' },
  { name: 'HubSpot AI', website: 'https://hubspot.com/ai', category: 'Marketing', tagline: 'AI marketing automation', pricing: 'FREEMIUM' },
  { name: 'Jasper', website: 'https://jasper.ai', category: 'Marketing', tagline: 'AI marketing copy', pricing: 'PAID' },
  { name: 'AdCreative.ai', website: 'https://adcreative.ai', category: 'Marketing', tagline: 'AI ad creation', pricing: 'PAID' },
  { name: 'Sprout Social AI', website: 'https://sproutsocial.com', category: 'Marketing', tagline: 'AI social media', pricing: 'PAID' },
  { name: 'Hootsuite AI', website: 'https://hootsuite.com', category: 'Marketing', tagline: 'AI social management', pricing: 'PAID' },
  
  // Data
  { name: 'ChatCSV', website: 'https://chatcsv.com', category: 'Data', tagline: 'Chat with CSV files', pricing: 'FREEMIUM' },
  { name: 'Julius AI', website: 'https://julius.ai', category: 'Data', tagline: 'AI data analysis', pricing: 'FREEMIUM' },
  { name: 'Akkio', website: 'https://akkio.com', category: 'Data', tagline: 'No-code AI analytics', pricing: 'PAID' },
  { name: 'Obviously AI', website: 'https://obviously.ai', category: 'Data', tagline: 'No-code AI predictions', pricing: 'PAID' },
  { name: 'DataRobot', website: 'https://datarobot.com', category: 'Data', tagline: 'AI ML platform', pricing: 'PAID' },
  { name: 'H2O.ai', website: 'https://h2o.ai', category: 'Data', tagline: 'AI cloud platform', pricing: 'FREEMIUM' },
  { name: 'RapidMiner', website: 'https://rapidminer.com', category: 'Data', tagline: 'Data science platform', pricing: 'PAID' },
  { name: 'KNIME', website: 'https://knime.com', category: 'Data', tagline: 'Data analytics platform', pricing: 'FREE' },
  { name: 'Tableau AI', website: 'https://tableau.com', category: 'Data', tagline: 'AI data visualization', pricing: 'PAID' },
  { name: 'Power BI', website: 'https://powerbi.microsoft.com', category: 'Data', tagline: 'Microsoft BI tool', pricing: 'PAID' },
];

interface ToolData {
  name: string;
  website: string;
  category: string;
  tagline: string;
  pricing: 'FREE' | 'FREEMIUM' | 'PAID' | 'OPEN_SOURCE' | 'ENTERPRISE';
}

async function findOrCreateCategory(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  
  let category = await prisma.category.findFirst({
    where: { name }
  });
  
  if (!category) {
    category = await prisma.category.create({
      data: {
        slug,
        name,
        description: `${name} AI tools`,
      }
    });
    console.log(`Created category: ${name}`);
  }
  
  return category;
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeUrl(url: string): string {
  // Remove trailing slashes and normalize
  return url.replace(/\/$/, '').toLowerCase();
}

async function saveTool(toolData: ToolData) {
  try {
    const normalizedUrl = normalizeUrl(toolData.website);
    const slug = generateSlug(toolData.name);
    
    // Check for duplicates by URL or slug
    const existing = await prisma.tool.findFirst({
      where: {
        OR: [
          { 
            website: { 
              in: [toolData.website, normalizedUrl, toolData.website + '/', normalizedUrl + '/'] 
            } 
          },
          { slug }
        ]
      }
    });
    
    if (existing) {
      console.log(`Skipping duplicate: ${toolData.name}`);
      return { action: 'skipped', name: toolData.name };
    }
    
    // Find or create category
    const category = await findOrCreateCategory(toolData.category);
    
    // Create tool
    await prisma.tool.create({
      data: {
        slug,
        name: toolData.name,
        tagline: toolData.tagline,
        description: toolData.tagline,
        website: toolData.website,
        categoryId: category.id,
        pricingTier: toolData.pricing,
        isActive: true,
        trendingScore: 50,
      }
    });
    
    console.log(`Created: ${toolData.name}`);
    return { action: 'created', name: toolData.name };
    
  } catch (error) {
    console.error(`Error saving ${toolData.name}:`, error);
    return { action: 'error', name: toolData.name };
  }
}

async function main() {
  console.log('Starting comprehensive AI tools import...\n');
  
  const results = {
    created: 0,
    skipped: 0,
    errors: 0,
  };
  
  for (const tool of MANUAL_TOOLS) {
    const result = await saveTool(tool);
    
    if (result.action === 'created') results.created++;
    else if (result.action === 'skipped') results.skipped++;
    else results.errors++;
    
    // Small delay to not overwhelm DB
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('\n--- Import Summary ---');
  console.log(`Total tools: ${MANUAL_TOOLS.length}`);
  console.log(`Created: ${results.created}`);
  console.log(`Skipped (duplicates): ${results.skipped}`);
  console.log(`Errors: ${results.errors}`);
  console.log('\nImport complete!');
  
  await prisma.$disconnect();
}

main().catch(console.error);

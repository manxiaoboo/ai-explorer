/**
 * Use Clearbit Logo API for real logos
 * Clearbit provides logos based on domain names
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map tools to their domains for Clearbit API
const toolDomains: Record<string, string> = {
  'ChatGPT': 'openai.com',
  'Claude': 'anthropic.com',
  'Google Gemini': 'google.com',
  'Midjourney': 'midjourney.com',
  'GitHub Copilot': 'github.com',
  'Notion': 'notion.so',
  'Figma': 'figma.com',
  'Canva': 'canva.com',
  'Grammarly': 'grammarly.com',
  'Jasper': 'jasper.ai',
  'Copy.ai': 'copy.ai',
  'Writesonic': 'writesonic.com',
  'Runway ML': 'runwayml.com',
  'Adobe Firefly': 'adobe.com',
  'DALL-E 3': 'openai.com',
  'Leonardo.ai': 'leonardo.ai',
  'Ideogram': 'ideogram.ai',
  'Pika Labs': 'pika.art',
  'Synthesia': 'synthesia.io',
  'HeyGen': 'heygen.com',
  'ElevenLabs': 'elevenlabs.io',
  'Murf AI': 'murf.ai',
  'Play.ht': 'play.ht',
  'Loom': 'loom.com',
  'Descript': 'descript.com',
  'Otter.ai': 'otter.ai',
  'Fireflies.ai': 'fireflies.ai',
  'Mem': 'mem.ai',
  'Taskade': 'taskade.com',
  'Linear': 'linear.app',
  'Raycast': 'raycast.com',
  'ClickUp': 'clickup.com',
  'Asana': 'asana.com',
  'Monday.com': 'monday.com',
  'Notion AI': 'notion.so',
  'QuillBot': 'quillbot.com',
  'Wordtune': 'wordtune.com',
  'DeepL': 'deepl.com',
  'Grammarly': 'grammarly.com',
  'Perplexity AI': 'perplexity.ai',
  'Poe': 'poe.com',
  'HuggingFace': 'huggingface.co',
  'Replit': 'replit.com',
  'Codeium': 'codeium.com',
  'Tabnine': 'tabnine.com',
  'Sourcegraph': 'sourcegraph.com',
  'Warp': 'warp.dev',
  'Vercel': 'vercel.com',
  'Netlify': 'netlify.com',
  'Supabase': 'supabase.com',
  'Firebase': 'firebase.google.com',
  'MongoDB': 'mongodb.com',
  'Redis': 'redis.io',
  'PostgreSQL': 'postgresql.org',
  'Docker': 'docker.com',
  'Kubernetes': 'kubernetes.io',
  'GitHub': 'github.com',
  'GitLab': 'gitlab.com',
  'Bitbucket': 'bitbucket.org',
  'Slack': 'slack.com',
  'Discord': 'discord.com',
  'Zoom': 'zoom.us',
  'Loom': 'loom.com',
};

async function updateLogosWithClearbit() {
  console.log('🚀 Updating logos with Clearbit API...\n');
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const [toolName, domain] of Object.entries(toolDomains)) {
    try {
      const tool = await prisma.tool.findFirst({
        where: { 
          name: { contains: toolName, mode: 'insensitive' },
          isActive: true 
        },
      });
      
      if (!tool) {
        console.log(`⏭️  Not found: ${toolName}`);
        skipped++;
        continue;
      }
      
      // Check if already has a non-data URL logo
      if (tool.logo && !tool.logo.startsWith('data:')) {
        console.log(`⏭️  Already has logo: ${toolName}`);
        skipped++;
        continue;
      }
      
      // Use Clearbit logo URL
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      
      // Update database with Clearbit URL
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: clearbitUrl },
      });
      
      console.log(`✅ Updated: ${toolName} -> ${clearbitUrl}`);
      updated++;
      
    } catch (error) {
      console.error(`❌ Failed: ${toolName}`, error);
      failed++;
    }
  }
  
  console.log('\n========================================');
  console.log('📊 Results');
  console.log('========================================');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);
  console.log('========================================\n');
  
  await prisma.$disconnect();
}

updateLogosWithClearbit();

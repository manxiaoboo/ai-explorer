/**
 * Hugging Face Metrics Updater
 * Fetches downloads, likes for AI models
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HFModelInfo {
  id: string;
  downloads: number;
  likes: number;
  modelId: string;
}

async function fetchHFModel(modelId: string): Promise<HFModelInfo | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`https://huggingface.co/api/models/${modelId}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Atooli-Updater/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Model not found: ${modelId}`);
      } else {
        console.error(`HF API error for ${modelId}: ${response.status}`);
      }
      return null;
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      modelId: modelId,
      downloads: data.downloads || 0,
      likes: data.likes || 0,
    };
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`Timeout fetching ${modelId}`);
    } else {
      console.error(`Error fetching ${modelId}:`, error);
    }
    return null;
  }
}

async function updateHFMetrics() {
  // Find tools with HF model IDs
  const tools = await prisma.tool.findMany({
    where: {
      hfModelId: { not: null },
      isActive: true
    }
  });
  
  console.log(`Updating HF metrics for ${tools.length} tools...\n`);
  
  for (const tool of tools) {
    if (!tool.hfModelId) continue;
    
    const info = await fetchHFModel(tool.hfModelId);
    if (!info) continue;
    
    // Calculate growth (if we have previous data)
    const downloadsGrowth = tool.hfDownloads 
      ? info.downloads - tool.hfDownloads 
      : 0;
    
    await prisma.tool.update({
      where: { id: tool.id },
      data: {
        hfDownloads: info.downloads,
        hfLikes: info.likes,
        hfDownloadsGrowth7d: downloadsGrowth,
        updatedAt: new Date()
      }
    });
    
    console.log(`✓ ${tool.name}: ${info.downloads.toLocaleString()} downloads, ${info.likes} likes`);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\nHF update complete!');
}

// Also try to discover HF models for existing tools
async function discoverHFModels() {
  console.log('\nDiscovering HF models for tools without hfModelId...\n');
  
  const tools = await prisma.tool.findMany({
    where: {
      hfModelId: null,
      isActive: true,
      OR: [
        { category: { name: { contains: 'Image', mode: 'insensitive' } } },
        { category: { name: { contains: 'Audio', mode: 'insensitive' } } },
        { category: { name: { contains: 'NLP', mode: 'insensitive' } } },
        { description: { contains: 'model', mode: 'insensitive' } }
      ]
    },
    include: { category: true },
    take: 20
  });
  
  for (const tool of tools) {
    // Try common HF naming patterns
    const possibleIds = [
      tool.name.toLowerCase().replace(/\s+/g, '-'),
      tool.slug,
      `openai/${tool.slug}`,
      `stabilityai/${tool.slug}`,
      `meta-llama/${tool.slug}`,
    ];
    
    for (const id of possibleIds) {
      const info = await fetchHFModel(id);
      if (info) {
        await prisma.tool.update({
          where: { id: tool.id },
          data: { hfModelId: info.modelId }
        });
        console.log(`✓ Found HF model for ${tool.name}: ${info.modelId}`);
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}

async function main() {
  console.log('=== Hugging Face Metrics Updater ===\n');
  
  await updateHFMetrics();
  await discoverHFModels();
  
  console.log('\n=== Done ===');
  await prisma.$disconnect();
}

main().catch(console.error);

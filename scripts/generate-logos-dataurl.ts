/**
 * Simple logo regeneration - just generate SVGs and update DB
 * Skip Vercel Blob for now, use data URLs
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// Brand colors
const brandColors: Record<string, string> = {
  'Chat': '#10a37f', 'Image': '#6366f1', 'Video': '#ec4899', 'Audio': '#f59e0b',
  'Code': '#181717', 'Writing': '#3b82f6', 'Research': '#8b5cf6',
  'Productivity': '#10b981', 'Design': '#f97316', 'Data': '#06b6d4',
  'Marketing': '#ef4444', 'Education': '#84cc16', 'Other': '#64748b',
};

// Get color for a tool
async function getToolColor(toolId: string, name: string): Promise<string> {
  const tool = await prisma.tool.findUnique({
    where: { id: toolId },
    include: { category: true }
  });
  
  if (tool?.category?.name) {
    for (const [category, color] of Object.entries(brandColors)) {
      if (tool.category.name.toLowerCase().includes(category.toLowerCase())) {
        return color;
      }
    }
  }
  
  // Generate deterministic color from name
  const hash = createHash('md5').update(name).digest('hex');
  const hue = parseInt(hash.substring(0, 2), 16) * 1.4;
  return `hsl(${hue}, 70%, 50%)`;
}

// Generate SVG data URL
function generateLogoDataUrl(name: string, color: string): string {
  const initial = name.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${color}"/><text x="50" y="68" font-size="50" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="bold">${initial}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function regenerateAllLogos() {
  console.log('🚀 Generating logos for all tools...\n');
  
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });
  
  console.log(`Found ${tools.length} tools\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const tool of tools) {
    try {
      const color = await getToolColor(tool.id, tool.name);
      const dataUrl = generateLogoDataUrl(tool.name, color);
      
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: dataUrl },
      });
      
      updated++;
      if (updated % 50 === 0) {
        console.log(`  Progress: ${updated}/${tools.length}`);
      }
    } catch (error) {
      console.error(`❌ Failed for ${tool.name}:`, error);
      failed++;
    }
  }
  
  console.log('\n========================================');
  console.log('📊 Complete');
  console.log('========================================');
  console.log(`Updated: ${updated}`);
  console.log(`Failed:  ${failed}`);
  console.log('========================================\n');
  
  await prisma.$disconnect();
}

regenerateAllLogos();

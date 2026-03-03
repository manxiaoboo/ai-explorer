/**
 * Complete logo regeneration workflow
 * 1. Delete all existing blobs
 * 2. Generate SVG logos for all tools
 * 3. Upload to Vercel Blob
 * 4. Update database
 */

import { put, list, del } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// Brand colors for different categories
const brandColors: Record<string, string> = {
  'Chat': '#10a37f',
  'Image': '#6366f1',
  'Video': '#ec4899',
  'Audio': '#f59e0b',
  'Code': '#181717',
  'Writing': '#3b82f6',
  'Research': '#8b5cf6',
  'Productivity': '#10b981',
  'Design': '#f97316',
  'Data': '#06b6d4',
  'Marketing': '#ef4444',
  'Education': '#84cc16',
  'Other': '#64748b',
};

// Get color for a tool based on its category
async function getToolColor(toolId: string): Promise<string> {
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
  
  // Generate deterministic color from tool name
  const hash = createHash('md5').update(tool?.name || toolId).digest('hex');
  const hue = parseInt(hash.substring(0, 2), 16) * 1.4; // 0-360
  return `hsl(${hue}, 70%, 50%)`;
}

// Generate SVG logo
function generateLogo(name: string, color: string): string {
  const initial = name.charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="${color}"/>
    <text x="50" y="68" font-size="50" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="bold">${initial}</text>
  </svg>`;
}

async function regenerateAllLogos() {
  console.log('🚀 Starting complete logo regeneration...\n');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN is not set');
    process.exit(1);
  }
  
  // Step 1: Delete all existing blobs
  console.log('Step 1: Deleting existing blobs...');
  const { blobs } = await list({ prefix: 'logos/' });
  console.log(`Found ${blobs.length} blobs to delete`);
  
  for (const blob of blobs) {
    await del(blob.url);
  }
  console.log(`✅ Deleted ${blobs.length} blobs\n`);
  
  // Step 2: Get all tools
  console.log('Step 2: Generating logos for all tools...');
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });
  
  console.log(`Found ${tools.length} tools\n`);
  
  // Step 3: Generate and upload logos
  let uploaded = 0;
  let failed = 0;
  
  for (const tool of tools) {
    try {
      // Get color for this tool
      const color = await getToolColor(tool.id);
      
      // Generate SVG
      const svg = generateLogo(tool.name, color);
      const buffer = Buffer.from(svg);
      
      // Create filename
      const hash = createHash('md5').update(tool.name).digest('hex').substring(0, 12);
      const filename = `logos/v2/${hash}.svg`;
      
      // Upload to Vercel Blob
      const blob = await put(filename, buffer, {
        access: 'private',
        contentType: 'image/svg+xml',
        addRandomSuffix: false,
      });
      
      // Update database
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: blob.url },
      });
      
      uploaded++;
      if (uploaded % 10 === 0) {
        console.log(`  Progress: ${uploaded}/${tools.length}`);
      }
    } catch (error) {
      console.error(`❌ Failed for ${tool.name}:`, error);
      failed++;
    }
  }
  
  console.log('\n========================================');
  console.log('📊 Regeneration Complete');
  console.log('========================================');
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Failed:   ${failed}`);
  console.log('========================================\n');
  
  await prisma.$disconnect();
}

regenerateAllLogos();

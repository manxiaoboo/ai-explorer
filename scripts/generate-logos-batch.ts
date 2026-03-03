/**
 * Generate logos in batches
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

const brandColors: Record<string, string> = {
  'Chat': '#10a37f', 'Image': '#6366f1', 'Video': '#ec4899', 'Audio': '#f59e0b',
  'Code': '#181717', 'Writing': '#3b82f6', 'Research': '#8b5cf6',
  'Productivity': '#10b981', 'Design': '#f97316', 'Data': '#06b6d4',
  'Marketing': '#ef4444', 'Education': '#84cc16', 'Other': '#64748b',
};

function getToolColor(name: string, categoryName: string | null): string {
  if (categoryName) {
    for (const [category, color] of Object.entries(brandColors)) {
      if (categoryName.toLowerCase().includes(category.toLowerCase())) {
        return color;
      }
    }
  }
  const hash = createHash('md5').update(name).digest('hex');
  const hue = parseInt(hash.substring(0, 2), 16) * 1.4;
  return `hsl(${hue}, 70%, 50%)`;
}

function generateLogoDataUrl(name: string, color: string): string {
  const initial = name.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${color}"/><text x="50" y="68" font-size="50" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="bold">${initial}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function generateBatch(start: number, batchSize: number) {
  const tools = await prisma.tool.findMany({
    where: { isActive: true },
    select: { id: true, name: true, category: { select: { name: true } } },
    skip: start,
    take: batchSize,
  });
  
  console.log(`Processing batch ${start}-${start + tools.length}...`);
  
  for (const tool of tools) {
    const color = getToolColor(tool.name, tool.category?.name || null);
    const dataUrl = generateLogoDataUrl(tool.name, color);
    
    await prisma.tool.update({
      where: { id: tool.id },
      data: { logo: dataUrl },
    });
  }
  
  console.log(`✅ Completed batch ${start}-${start + tools.length}`);
  return tools.length;
}

async function main() {
  const total = await prisma.tool.count({ where: { isActive: true } });
  console.log(`Total tools: ${total}\n`);
  
  const batchSize = 50;
  let processed = 0;
  
  for (let i = 0; i < total; i += batchSize) {
    const count = await generateBatch(i, batchSize);
    processed += count;
    console.log(`Progress: ${processed}/${total}\n`);
  }
  
  console.log('✅ All done!');
  await prisma.$disconnect();
}

main().catch(console.error);

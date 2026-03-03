import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProgress() {
  const total = await prisma.tool.count();
  const cdnCount = await prisma.tool.count({
    where: { logo: { startsWith: 'https://' } }
  });
  const base64Count = await prisma.tool.count({
    where: { logo: { startsWith: 'data:' } }
  });
  const nullCount = await prisma.tool.count({
    where: { logo: null }
  });
  
  console.log('\n========================================');
  console.log('📊 Logo Migration Progress');
  console.log('========================================');
  console.log(`Total tools:     ${total}`);
  console.log(`CDN URLs:        ${cdnCount} (${Math.round(cdnCount/total*100)}%)`);
  console.log(`Base64 (data:):  ${base64Count} (${Math.round(base64Count/total*100)}%)`);
  console.log(`No logo (null):  ${nullCount} (${Math.round(nullCount/total*100)}%)`);
  console.log('========================================\n');
  
  if (base64Count > 0) {
    const remaining = await prisma.tool.findMany({
      where: { logo: { startsWith: 'data:' } },
      select: { name: true },
      take: 10
    });
    console.log('Remaining base64 logos (first 10):');
    remaining.forEach(t => console.log(`  - ${t.name}`));
    console.log('');
  }
  
  await prisma.$disconnect();
}

checkProgress();

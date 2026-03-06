import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tools = await prisma.tool.findMany({
    select: { id: true, name: true, logo: true },
  });

  let externalCount = 0;
  let blobCount = 0;
  let nullCount = 0;
  let dataUrlCount = 0;
  let otherCount = 0;

  const externalTools: { name: string; logo: string }[] = [];

  for (const tool of tools) {
    if (!tool.logo) {
      nullCount++;
    } else if (tool.logo.includes('vercel-storage.com') || tool.logo.includes('blob.vercel')) {
      blobCount++;
    } else if (tool.logo.startsWith('data:')) {
      dataUrlCount++;
    } else if (tool.logo.startsWith('http')) {
      externalCount++;
      externalTools.push({ name: tool.name, logo: tool.logo });
    } else {
      otherCount++;
    }
  }

  console.log('\n📊 Logo 来源统计:\n');
  console.log(`  🔗 外部 URL (需迁移): ${externalCount}`);
  console.log(`  ☁️  Vercel Blob: ${blobCount}`);
  console.log(`  📄 Data URL: ${dataUrlCount}`);
  console.log(`  📁 本地/其他: ${otherCount}`);
  console.log(`  ❌ 无 Logo: ${nullCount}`);
  console.log(`  📦 总计: ${tools.length}\n`);

  if (externalTools.length > 0) {
    console.log('外部 Logo 示例 (前10个):');
    externalTools.slice(0, 10).forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name}`);
      console.log(`     ${t.logo.substring(0, 70)}...`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);

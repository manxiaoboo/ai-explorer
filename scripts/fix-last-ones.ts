import { prisma } from './lib/prisma';

async function main() {
  const toFix = [
    { name: 'cherry-studio', domain: 'cherry-ai.com' },
    { name: 'FocuSee', domain: 'focusee.io' },
    { name: 'Visual Field Test', domain: 'visualfieldtest.com' }
  ];
  
  for (const item of toFix) {
    const tool = await prisma.tool.findFirst({
      where: { name: item.name },
      select: { id: true, name: true }
    });
    
    if (tool) {
      // 使用Clearbit
      const logoUrl = `https://logo.clearbit.com/${item.domain}?size=256`;
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: logoUrl }
      });
      console.log(`✅ ${tool.name}: ${logoUrl}`);
    }
  }
}

main().catch(console.error);

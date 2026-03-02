import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkElicit() {
  const tool = await prisma.tool.findFirst({
    where: { name: 'Elicit' },
    include: { pricingPlans: true }
  });

  if (tool) {
    console.log('Tool:', tool.name);
    console.log('Pricing Tier:', tool.pricingTier);
    console.log('Price Start:', tool.priceStart);
    console.log('Plans:');
    for (const p of tool.pricingPlans) {
      console.log('  -', p.name, ':', p.price === null ? 'Custom' : '$' + p.price + '/' + p.priceUnit);
    }
  }
  await prisma.$disconnect();
}

checkElicit();

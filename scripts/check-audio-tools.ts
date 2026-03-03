import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toolsToCheck = [
  'Coqui TTS', 'CogVideo', 'GPT-SoVITS', 'Bark', 'StyleTTS 2',
  'Tortoise TTS', 'CogVideo', 'Automatic1111', 'Mochi Diffusion'
];

async function checkTools() {
  console.log('Checking tools:\n');
  
  for (const name of toolsToCheck) {
    const tool = await prisma.tool.findFirst({
      where: { name: { contains: name, mode: 'insensitive' } },
      select: { name: true, logo: true }
    });
    
    if (tool) {
      console.log(`${tool.name}:`);
      console.log(`  Logo: ${tool.logo || 'null'}`);
      console.log('');
    } else {
      console.log(`${name}: NOT FOUND`);
    }
  }
  
  await prisma.$disconnect();
}

checkTools();

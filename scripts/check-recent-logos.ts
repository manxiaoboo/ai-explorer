import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 检查最近更新的Logo');
  console.log('='.repeat(70));
  
  const recentTools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: { 
      name: true, 
      website: true, 
      logo: true,
      updatedAt: true 
    }
  });
  
  console.log('最近更新的20个Logo:\n');
  
  for (const tool of recentTools) {
    console.log(`${tool.name}`);
    console.log(`  更新时间: ${tool.updatedAt.toISOString()}`);
    console.log(`  官网: ${tool.website}`);
    console.log(`  Logo: ${tool.logo?.slice(0, 70)}...`);
    
    // 提取域名
    const domain = tool.website?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const logoDomain = tool.logo?.match(/logo\.clearbit\.com\/([^?]+)/)?.[1] ||
                       tool.logo?.match(/icons\.duckduckgo\.com\/ip3\/([^?]+)/)?.[1] ||
                       tool.logo?.match(/google\.com\/s2\/favicons.*domain=([^&]+)/)?.[1];
    
    if (logoDomain && domain && !logoDomain.includes(domain)) {
      console.log(`  ⚠️  Logo域名(${logoDomain})与官网域名(${domain})不匹配！`);
    } else {
      console.log(`  ✅ 正常`);
    }
    console.log('');
  }
}

main().catch(console.error);

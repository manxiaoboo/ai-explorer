import { prisma } from './lib/prisma';

async function main() {
  console.log('='.repeat(80));
  console.log('🔍 深度分析：检查是否共享同一个错误Logo');
  console.log('='.repeat(80));
  
  // 获取所有工具的logo
  const tools = await prisma.tool.findMany({
    where: { logo: { not: { equals: null } } },
    select: { name: true, website: true, logo: true, id: true },
    orderBy: { name: 'asc' }
  });
  
  console.log(`\n总共 ${tools.length} 个工具有Logo\n`);
  
  // 1. 检查是否有完全相同的Logo URL
  const urlMap = new Map<string, string[]>();
  
  for (const tool of tools) {
    const url = tool.logo!;
    if (!urlMap.has(url)) {
      urlMap.set(url, []);
    }
    urlMap.get(url)!.push(tool.name);
  }
  
  console.log('📊 Logo URL重复情况：');
  console.log('-'.repeat(80));
  
  let duplicateCount = 0;
  for (const [url, names] of urlMap.entries()) {
    if (names.length > 1) {
      duplicateCount++;
      console.log(`\n⚠️  发现重复URL (${names.length}个工具共享):`);
      console.log(`   URL: ${url}`);
      console.log(`   工具: ${names.join(', ')}`);
    }
  }
  
  if (duplicateCount === 0) {
    console.log('✅ 没有发现重复的Logo URL\n');
  }
  
  // 2. 检查之前指向X domain的工具
  console.log('\n' + '='.repeat(80));
  console.log('🔍 检查之前修复过的工具（原URL指向x.com）:');
  console.log('-'.repeat(80));
  
  const xTools = ['Manus', 'Nora AI', 'HeyFish AI', 'Atomic Mail', 'Opal44', 'Hostinger OpenClaw Hosting', 'ThumbnailCreator'];
  
  for (const name of xTools) {
    const tool = tools.find(t => t.name === name);
    if (tool) {
      console.log(`\n📌 ${tool.name}`);
      console.log(`   ID: ${tool.id}`);
      console.log(`   当前Logo: ${tool.logo}`);
      
      // 检查Logo是否是X的
      const isX = tool.logo?.includes('x.com') || 
                  tool.logo?.includes('twitter.com') ||
                  tool.logo?.includes('duckduckgo.com/ip3/x.com');
      
      if (isX) {
        console.log('   🔴🔴🔴 当前Logo仍是X！');
      } else {
        console.log('   ✅ 当前Logo正常');
      }
    }
  }
  
  // 3. 检查特定domain的Logo
  console.log('\n' + '='.repeat(80));
  console.log('🔍 按Domain分组检查:');
  console.log('-'.repeat(80));
  
  const domainGroups = new Map<string, {name: string, logo: string}[]>();
  
  for (const tool of tools) {
    if (tool.logo) {
      try {
        const domain = new URL(tool.logo).hostname;
        if (!domainGroups.has(domain)) {
          domainGroups.set(domain, []);
        }
        domainGroups.get(domain)!.push({name: tool.name, logo: tool.logo});
      } catch {}
    }
  }
  
  for (const [domain, items] of domainGroups.entries()) {
    console.log(`\n📁 ${domain} (${items.length}个工具):`);
    items.slice(0, 5).forEach(item => {
      console.log(`   - ${item.name}`);
    });
    if (items.length > 5) {
      console.log(`   ... 还有 ${items.length - 5} 个`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);

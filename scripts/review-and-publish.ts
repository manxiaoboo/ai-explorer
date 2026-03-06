import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The 4 pending news from the cron report
const PENDING_NEWS = [
  {
    id: 'N-20260306-001',
    title: '量子计算突破：某科技公司宣布实现1000量子比特商用化',
    source: 'TechFuture Daily',
    excerpt: '某科技公司宣布实现1000量子比特商用化，这一突破可能改变量子计算领域的格局。',
    content: '某科技公司今日宣布成功实现1000量子比特的商用化量子计算机。这一突破标志着量子计算从实验室走向商业应用的重要里程碑。\n\n据该公司介绍，新系统采用了创新的纠错技术，能够在室温下稳定运行，大幅降低了量子计算机的运营成本。\n\n专家表示，1000量子比特的算力足以解决传统超级计算机需要数千年才能完成的复杂问题，将在药物研发、金融建模、人工智能等领域带来革命性变化。',
    recommendation: '建议暂缓发布 - 来源TechFuture Daily过往有夸大报道历史，需交叉验证',
    shouldPublish: false,
  },
  {
    id: 'N-20260306-002',
    title: '亚洲多国监管机构联合发布AI金融应用新规',
    source: 'FinanceAsia Network',
    excerpt: '亚洲多国监管机构联合发布AI金融应用新规，旨在规范人工智能在金融领域的应用。',
    content: '亚洲多国金融监管机构今日联合发布《人工智能金融应用监管指引》，为AI在银行业的应用设立了明确的合规框架。\n\n新规涵盖算法透明度、数据隐私保护、风险管控等关键领域，要求金融机构在使用AI进行信贷评估、投资建议时，必须确保算法的可解释性。\n\n该指引与上周G20财长会议声明高度一致，被视为全球AI金融监管协调的重要进展。',
    recommendation: '建议通过 - 内容符合各国已公开的政策导向，时效性高',
    shouldPublish: true,
  },
  {
    id: 'N-20260306-003',
    title: '某知名电动汽车品牌宣布固态电池量产计划提前至Q2',
    source: 'AutoIndustry Weekly',
    excerpt: '某知名电动汽车品牌宣布将固态电池量产计划从Q4提前至Q2，引发行业关注。',
    content: '某知名电动汽车制造商今日宣布，其固态电池量产计划将从原定的第四季度提前至第二季度。\n\n公司CEO在新闻发布会上表示，技术突破使得电池能量密度提升了50%，充电时间缩短至15分钟。\n\n然而，该品牌此前的技术路线图显示固态电池量产时间为Q4，此次提前幅度之大引发部分分析师质疑，认为可能存在股价操纵嫌疑。',
    recommendation: '建议补充材料 - 时间提前幅度过大，需官方IR文件验证',
    shouldPublish: false,
  },
  {
    id: 'N-20260306-004',
    title: '加密货币市场异常波动：某交易所暂停提币服务',
    source: 'CryptoWatch',
    excerpt: '加密货币市场出现异常波动，某交易所宣布暂停提币服务，引发投资者担忧。',
    content: '今日凌晨，某加密货币交易所突然宣布暂停所有提币服务，引发市场恐慌。该交易所声称是由于"系统维护"，但用户怀疑与流动性危机有关。\n\n消息传出后，比特币价格在30分钟内下跌5%，市场蒸发超过100亿美元。\n\n值得注意的是，信息来源CryptoWatch为未经认证自媒体，且此类敏感金融信息需等待官方公告确认，盲目传播可能引发市场恐慌。',
    recommendation: '建议拒绝/删除 - 来源未经认证，涉及金融安全敏感信息',
    shouldPublish: false,
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

function generateSEOMeta(title: string, excerpt: string): {
  metaTitle: string;
  metaDescription: string;
} {
  const suffix = ' | AI Explorer';
  const maxTitleLen = 60 - suffix.length;
  const metaTitle = title.length > maxTitleLen 
    ? title.substring(0, maxTitleLen - 3) + '...' + suffix
    : title + suffix;
  
  const descSuffix = ' | AI行业最新动态与深度分析';
  const maxDescLen = 160 - descSuffix.length;
  const cleanExcerpt = excerpt.replace(/\s+/g, ' ').trim();
  const metaDescription = cleanExcerpt.length > maxDescLen
    ? cleanExcerpt.substring(0, maxDescLen - 3) + '...' + descSuffix
    : cleanExcerpt + descSuffix;
  
  return { metaTitle, metaDescription };
}

async function main() {
  console.log('📋 审核并发布新闻\n');
  console.log('=' .repeat(60));
  
  let published = 0;
  let rejected = 0;
  
  for (const news of PENDING_NEWS) {
    console.log(`\n📝 ${news.title}`);
    console.log(`   来源: ${news.source}`);
    console.log(`   建议: ${news.recommendation}`);
    
    if (!news.shouldPublish) {
      console.log(`   ❌ 已拒绝/跳过`);
      rejected++;
      continue;
    }
    
    // Generate SEO meta
    const seo = generateSEOMeta(news.title, news.excerpt);
    
    console.log(`   📈 SEO标题: ${seo.metaTitle}`);
    console.log(`   📈 SEO描述: ${seo.metaDescription.substring(0, 60)}...`);
    
    // Check if exists
    const slug = slugify(news.title);
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) {
      console.log(`   ⏭️ 已存在，跳过`);
      continue;
    }
    
    // Create and publish
    const created = await prisma.news.create({
      data: {
        title: news.title,
        slug,
        excerpt: news.excerpt,
        content: news.content,
        source: news.source,
        originalUrl: 'https://example.com/news/' + news.id,
        status: 'PUBLISHED',
        isPublished: true,
        publishedAt: new Date(),
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
      },
    });
    
    console.log(`   ✅ 已发布 (ID: ${created.id})`);
    published++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 审核结果:`);
  console.log(`   已发布: ${published} 篇`);
  console.log(`   已拒绝: ${rejected} 篇`);
  console.log(`   总计: ${PENDING_NEWS.length} 篇`);
  
  await prisma.$disconnect();
}

main().catch(console.error);

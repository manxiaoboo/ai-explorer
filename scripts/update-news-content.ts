import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateNewsWithContent() {
  // Anthropic 新闻完整内容
  const anthropicContent = `Anthropic CEO Dario Amodei said Thursday that he "cannot in good conscience accede" to the Pentagon's request to give the military unrestricted access to its AI systems.

"Anthropic understands that the Department of War, not private companies, makes military decisions," Amodei wrote in a statement. "However, in a narrow set of cases, we believe AI can undermine, rather than defend, democratic values. Some uses are also simply outside the bounds of what today's technology can safely and reliably do."

The two cases are: mass surveillance of Americans and fully autonomous weapons with no human in the loop. The Pentagon believes it should be able to use Anthropic's model for all lawful purposes, and that its uses shouldn't be dictated by a private company.

Amodei's statement comes less than 24 hours ahead of the Friday 5:01 p.m. deadline Defense Secretary Pete Hegseth has given Anthropic to either acquiesce to his demands, or face the consequences. An Anthropic spokesperson told TechCrunch Amodei's statement does not mean the firm is walking away from negotiations and is continuing to engage in good faith with the Department going forward.

"The contract language we received overnight from the Department of War made virtually no progress on preventing Claude's use for mass surveillance of Americans or in fully autonomous weapons," an Anthropic spokesperson told TechCrunch. "New language framed as compromise was paired with legalese that would allow those safeguards to be disregarded at will."`;

  // Prada Meta 新闻完整内容
  const pradaContent = `Could Meta be preparing to launch a Prada version of its Meta AI glasses? That's the speculation after Mark Zuckerberg and his wife, Priscilla, were spotted sitting in the front row of Prada's Fall/Winter 2026 Fashion Week show in Milan on Thursday. The social media exec was seen chatting with his seatmate, Lorenzo Bertelli, Prada's chief merchandising officer and son of head designer Miuccia Prada.

While Zuckerberg has been working to polish his image in recent years, including with upgraded threads, it's likely that he wasn't at Prada for the fashion, but rather because of an upcoming collaboration with the brand.

CNBC reported last summer that Prada AI glasses were in the works, among others. However, Meta has yet to publicly announce such a deal.

EssilorLuxottica, the French-Italian eyewear brand and Ray-Ban maker, has been working with Meta on these high-tech devices since their debut, initially under the Ray-Ban Stories brand. This month, the company announced it sold over 7 million AI glasses in 2025, up from 2 million in the prior year. Those sales included both Ray-Ban Meta and Oakley Meta glasses, the latter designed more for the athletic types.

Now, it seems, Prada AI glasses could be next, given that Prada and EssilorLuxottica already renewed their licensing deal for eyewear under the Prada and Miu Miu brands for the next ten years.

Prada AI glasses could give Meta a foothold in the high-fashion market, a niche that its Oakleys and Ray-Bans don't yet fill. Establishing the glasses as a luxury symbol could also benefit Meta's brand overall.

However, there are some concerns that AI glasses aren't the right fit for a world that's seeing an increased consumer backlash against surveillance devices, which have recently led people to rip out their Ring doorbells and smash Flock cameras. This shift could see Meta reconsidering whether it will add facial-recognition features to its glasses, as The New York Times recently reported.`;

  console.log('=== 更新新闻内容 ===\n');
  
  // 更新 Anthropic 新闻
  await prisma.news.update({
    where: { id: 'cmm46r2f30001rnqqcdxmrfv5' },
    data: {
      content: anthropicContent
    }
  });
  console.log(`✅ Anthropic 新闻已更新 (${anthropicContent.length} 字符)`);
  
  // 更新 Prada 新闻
  await prisma.news.update({
    where: { id: 'cmm46r3c70002rnqqhk141sls' },
    data: {
      content: pradaContent
    }
  });
  console.log(`✅ Prada Meta 新闻已更新 (${pradaContent.length} 字符)`);
  
  console.log('\n=== 完成 ===');
  await prisma.$disconnect();
}

updateNewsWithContent();

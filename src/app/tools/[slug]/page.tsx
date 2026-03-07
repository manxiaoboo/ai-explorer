import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";
import { ToolLogo } from "@/components/ToolLogo";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getTool(slug: string) {
  return prisma.tool.findUnique({
    where: { slug },
    include: { 
      category: true,
      pricingPlans: {
        orderBy: { sortOrder: 'asc' }
      }
    },
  });
}

async function getRelatedTools(categoryId: string, currentToolId: string) {
  return prisma.tool.findMany({
    where: { 
      isActive: true,
      categoryId,
      id: { not: currentToolId },
    },
    orderBy: { trendingScore: "desc" },
    take: 4,
  });
}

async function getAlternativeTools(categoryId: string, currentToolId: string) {
  return prisma.tool.findMany({
    where: { 
      isActive: true,
      categoryId,
      id: { not: currentToolId },
    },
    orderBy: { githubStars: "desc" },
    take: 3,
  });
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  if (!tool) {
    return { 
      title: "Tool Not Found - Atooli",
      description: "The requested AI tool could not be found. Explore our directory of 300+ AI tools."
    };
  }
  
  // SEO 优化的标题模板
  const title = `${tool.name} - ${tool.tagline} | ${tool.category.name} AI Tool`;
  
  // 扩展描述，包含更多关键词
  const description = tool.description.length > 155 
    ? tool.description.slice(0, 152) + '...'
    : `${tool.description} Discover ${tool.name} and 300+ other AI ${tool.category.name.toLowerCase()} tools at Atooli.`;
  
  // 生成关键词
  const keywords = [
    tool.name,
    `${tool.name} review`,
    `${tool.name} alternative`,
    `${tool.category.name} AI tools`,
    `best ${tool.category.name.toLowerCase()} AI`,
    'AI tools directory',
    'AI software',
    ...(tool.pricingTier === 'OPEN_SOURCE' ? ['open source AI'] : []),
    ...(tool.hasFreeTier ? ['free AI tool'] : []),
  ];
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical: `/tools/${slug}`,
    },
    openGraph: {
      title: `${tool.name} - ${tool.tagline}`,
      description: tool.description.slice(0, 200),
      url: `https://tooli.ai/tools/${slug}`,
      siteName: 'Atooli',
      images: tool.logo ? [
        {
          url: tool.logo,
          width: 1200,
          height: 630,
          alt: `${tool.name} logo`,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} - ${tool.tagline}`,
      description: tool.description.slice(0, 160),
      images: tool.logo ? [tool.logo] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  if (!tool) {
    notFound();
  }

  const relatedTools = await getRelatedTools(tool.category.id, tool.id);
  const alternativeTools = await getAlternativeTools(tool.category.id, tool.id);

  // SoftwareApplication 结构化数据 - 增强版
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: tool.category.name === 'Code' ? 'DeveloperApplication' : 
                         tool.category.name === 'Image' ? 'DesignApplication' :
                         tool.category.name === 'Audio' ? 'MultimediaApplication' :
                         tool.category.name === 'Video' ? 'MultimediaApplication' :
                         tool.category.name === 'Writing' ? 'BusinessApplication' :
                         'AIApplication',
    operatingSystem: "Web, Windows, macOS, Linux",
    offers: {
      "@type": "Offer",
      price: tool.priceStart || (tool.pricingTier === 'FREE' ? 0 : undefined),
      priceCurrency: "USD",
      availability: tool.pricingTier === 'FREE' ? 'https://schema.org/Free' : 'https://schema.org/InStock',
    },
    description: tool.description,
    url: tool.website,
    category: tool.category.name,
    featureList: tool.features,
    ...(tool.githubStars && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Math.min(5, (tool.githubStars / 1000) + 3).toFixed(1),
        ratingCount: tool.githubStars,
        bestRating: "5",
        worstRating: "1"
      }
    }),
    ...(tool.logo && { image: tool.logo }),
    ...(tool.githubRepo && { codeRepository: tool.githubRepo }),
    softwareVersion: "Latest",
    datePublished: tool.createdAt ? new Date(tool.createdAt).toISOString() : undefined,
    dateModified: tool.updatedAt ? new Date(tool.updatedAt).toISOString() : undefined,
  };

  // FAQ 结构化数据
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.description
        }
      },
      {
        "@type": "Question",
        name: `Is ${tool.name} free to use?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.pricingTier === 'FREE' 
            ? `Yes, ${tool.name} is completely free to use.`
            : tool.pricingTier === 'FREEMIUM'
            ? `Yes, ${tool.name} offers a free tier with basic features. Premium features require a paid subscription.`
            : tool.pricingTier === 'OPEN_SOURCE'
            ? `Yes, ${tool.name} is open source and free to use. You can also self-host it.`
            : `${tool.name} requires a paid subscription. Check their website for current pricing.`
        }
      },
      {
        "@type": "Question",
        name: `What are the best alternatives to ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Some popular alternatives to ${tool.name} in the ${tool.category.name} category include: ${alternativeTools.slice(0, 3).map(t => t.name).join(', ')}. Explore more alternatives on Atooli.`
        }
      }
    ]
  };

  // Breadcrumb 结构化数据
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://tooli.ai",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://tooli.ai/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.category.name,
        item: `https://tooli.ai/category/${tool.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: tool.name,
        item: `https://tooli.ai/tools/${slug}`,
      },
    ],
  };

  // ItemList 结构化数据 (用于相关工具)
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: relatedTools.map((t, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://tooli.ai/tools/${t.slug}`,
      name: t.name
    }))
  };

  const pricingLabel = {
    FREE: "Free",
    FREEMIUM: "Freemium",
    PAID: "Paid",
    ENTERPRISE: "Enterprise",
    OPEN_SOURCE: "Open Source",
  }[tool.pricingTier];

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData data={faqData} />
      <StructuredData data={breadcrumbData} />
      <StructuredData data={itemListData} />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-[var(--accent)]">Tools</Link>
          <span>/</span>
          <Link href={`/category/${tool.category.slug}`} className="hover:text-[var(--accent)]">
            {tool.category.name}
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]" aria-current="page">{tool.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-8">
            {/* Header Card */}
            <div className="bg-[var(--surface)] rounded-lg p-6 mb-6">
              <div className="flex items-start gap-5">
                <ToolLogo name={tool.name} logo={tool.logo} size="lg" />
                
                <div className="flex-1">
                  <h1 className="text-3xl font-semibold text-[var(--foreground)] mb-2">
                    {tool.name}
                  </h1>
                  <p className="text-lg text-[var(--muted)] mb-4">{tool.tagline}</p>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Link 
                      href={`/category/${tool.category.slug}`}
                      className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-full text-sm text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                    >
                      {tool.category.name}
                    </Link>
                    <span className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-full text-sm font-medium">
                      {pricingLabel}
                    </span>
                    {tool.trendingScore > 70 && (
                      <span className="px-3 py-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-full text-sm text-[var(--accent)] font-medium">
                        🔥 Trending
                      </span>
                    )}
                    {tool.pricingTier === 'OPEN_SOURCE' && (
                      <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-600 font-medium">
                        Open Source
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick CTA for Mobile */}
            <div className="lg:hidden mb-6">
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 bg-[var(--accent)] text-white text-center font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Visit {tool.name} Website →
              </a>
            </div>

            {/* Description */}
            <section className="mb-8" id="about">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                About {tool.name}
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-[var(--foreground)] leading-relaxed text-lg">{tool.description}</p>
              </div>
              
              {/* SEO 优化的长尾内容 */}
              <div className="mt-6 p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <h3 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
                  Key Highlights
                </h3>
                <ul className="space-y-2 text-sm text-[var(--foreground)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-0.5">✓</span>
                    <span>Category: {tool.category.name} AI Tool</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-0.5">✓</span>
                    <span>Pricing: {pricingLabel}{tool.hasFreeTier ? ' (Free tier available)' : ''}</span>
                  </li>
                  {tool.githubStars && tool.githubStars > 100 && (
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-0.5">✓</span>
                      <span>Popular: {tool.githubStars.toLocaleString()}+ GitHub stars</span>
                    </li>
                  )}
                </ul>
              </div>
            </section>

            {/* Features */}
            {tool.features?.length > 0 && (
              <section className="mb-8" id="features">
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                  Features
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 p-3 bg-[var(--background)] rounded-lg">
                      <span className="text-[var(--accent)] mt-0.5 text-lg">•</span>
                      <span className="text-[var(--foreground)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Use Cases */}
            {tool.useCases?.length > 0 && (
              <section className="mb-8" id="use-cases">
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                  Use Cases
                </h2>
                <ul className="space-y-3">
                  {tool.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-3">
                      <span className="text-[var(--accent)] mt-1">→</span>
                      <span className="text-[var(--foreground)]">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* FAQ Section - SEO 优化 */}
            <section className="mb-8" id="faq">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <details className="group bg-[var(--background)] rounded-lg border border-[var(--border)]">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-[var(--foreground)]">
                    What is {tool.name}?
                    <span className="text-[var(--accent)] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-[var(--foreground)]">
                    {tool.description}
                  </div>
                </details>
                
                <details className="group bg-[var(--background)] rounded-lg border border-[var(--border)]">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-[var(--foreground)]">
                    Is {tool.name} free?
                    <span className="text-[var(--accent)] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-[var(--foreground)]">
                    {tool.pricingTier === 'FREE' 
                      ? `Yes, ${tool.name} is completely free to use.`
                      : tool.pricingTier === 'FREEMIUM'
                      ? `Yes, ${tool.name} offers a free tier with basic features. Premium features require a paid subscription.`
                      : tool.pricingTier === 'OPEN_SOURCE'
                      ? `Yes, ${tool.name} is open source and free to use. You can also self-host it.`
                      : `${tool.name} requires a paid subscription. Check their website for current pricing.`}
                  </div>
                </details>
                
                <details className="group bg-[var(--background)] rounded-lg border border-[var(--border)]">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-[var(--foreground)]">
                    What are the best alternatives to {tool.name}?
                    <span className="text-[var(--accent)] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-[var(--foreground)]">
                    Some popular alternatives include: {alternativeTools.slice(0, 3).map(t => t.name).join(', ')}. 
                    Explore more {tool.category.name.toLowerCase()} tools on Atooli.
                  </div>
                </details>
              </div>
            </section>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <section id="related-tools">
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                  Similar {tool.category.name} Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedTools.map((relatedTool) => (
                    <ToolCard 
                      key={relatedTool.id} 
                      tool={{...relatedTool, category: tool.category}} 
                      compact 
                    />
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* CTA Card */}
            <div className="bg-[var(--accent)] rounded-lg p-5">
              <h3 className="text-white font-semibold mb-3">Try {tool.name}</h3>
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-[var(--background)] text-[var(--foreground)] text-center font-medium rounded hover:bg-[var(--surface)] transition-colors"
              >
                Visit Website →
              </a>
              <p className="text-xs text-white/80 text-center mt-3">
                External link opens in new tab
              </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-[var(--surface)] rounded-lg p-5">
              <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
                Pricing
              </h3>
              
              {/* Multi-tier Pricing Plans */}
              {tool.pricingPlans && tool.pricingPlans.length > 0 ? (
                <div className="space-y-3">
                  {tool.pricingPlans.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`p-3 rounded-lg border ${
                        plan.isPopular 
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5' 
                          : 'border-[var(--border)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[var(--foreground)]">
                          {plan.name}
                        </span>
                        {plan.isPopular && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-white rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-[var(--foreground)] mb-2">
                        {plan.price === 0 ? (
                          'Free'
                        ) : plan.price === null ? (
                          'Custom'
                        ) : (
                          `$${plan.price}/${plan.priceUnit === 'month' ? 'mo' : plan.priceUnit === 'year' ? 'yr' : plan.priceUnit}`
                        )}
                      </div>
                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-1">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-xs text-[var(--muted)] flex items-start gap-1">
                              <span className="text-[var(--accent)]">•</span>
                              {feature}
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-xs text-[var(--muted)]">
                              +{plan.features.length - 3} more
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback to simple pricing display */
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Type</span>
                    <span className="text-[var(--foreground)] font-medium">{pricingLabel}</span>
                  </div>
                  
                  {tool.priceStart && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted)]">From</span>
                      <span className="text-[var(--foreground)] font-medium">${tool.priceStart}/mo</span>
                    </div>
                  )}
                  
                  {tool.hasFreeTier && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted)]">Free tier</span>
                      <span className="text-[var(--success)]">✓ Yes</span>
                    </div>
                  )}
                  
                  {tool.hasTrial && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted)]">Free trial</span>
                      <span className="text-[var(--success)]">✓ Yes</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Metrics Card */}
            <div className="bg-[var(--surface)] rounded-lg p-5">
              <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
                Popularity
              </h3>
              
              <div className="space-y-3">
                {tool.githubStars && tool.githubStars > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">GitHub Stars</span>
                    <span className="text-[var(--foreground)] font-medium">{tool.githubStars.toLocaleString()}</span>
                  </div>
                )}
                
                {tool.productHuntVotes && tool.productHuntVotes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Product Hunt</span>
                    <span className="text-[var(--foreground)] font-medium">{tool.productHuntVotes}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Trending Score</span>
                  <span className="text-[var(--foreground)] font-medium">{tool.trendingScore.toFixed(0)}/100</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            {tool.githubRepo && (
              <div className="bg-[var(--surface)] rounded-lg p-5">
                <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
                  Resources
                </h3>
                <a 
                  href={tool.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                >
                  <span>⭐</span> GitHub Repository
                </a>
              </div>
            )}

            {/* Report */}
            <div className="border border-[var(--border)] rounded-lg p-4">
              <p className="text-xs text-[var(--muted)] text-center">
                Something wrong with this listing?{" "}
                <a href="mailto:billman@attooli.com" className="text-[var(--accent)] hover:underline">
                  Let us know
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

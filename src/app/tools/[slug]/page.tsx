import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ToolListItem } from "@/components/ToolListItem";
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
    take: 5,
    include: { category: true },
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
    include: { category: true },
  });
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  if (!tool) {
    return { 
      title: "Tool Not Found - Atooli",
      description: "The requested AI tool could not be found."
    };
  }
  
  const title = `${tool.name} - ${tool.tagline} | ${tool.category.name} AI Tool`;
  const description = tool.description.length > 155 
    ? tool.description.slice(0, 152) + '...'
    : tool.description;
  
  return {
    title,
    description,
    alternates: {
      canonical: `/tools/${slug}`,
    },
    openGraph: {
      title: `${tool.name} - ${tool.tagline}`,
      description: tool.description.slice(0, 200),
      url: `https://tooli.ai/tools/${slug}`,
      siteName: 'Atooli',
      images: tool.logo ? [{ url: tool.logo, width: 1200, height: 630, alt: `${tool.name} logo` }] : [],
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

  const pricingLabel = {
    FREE: "Free",
    FREEMIUM: "Freemium",
    PAID: "Paid",
    ENTERPRISE: "Enterprise",
    OPEN_SOURCE: "Open Source",
  }[tool.pricingTier];

  const pricingColors: Record<string, string> = {
    FREE: "text-[var(--accent-2)] bg-[var(--accent-2-muted)]",
    FREEMIUM: "text-[#b8860b] bg-[var(--accent-3-muted)]",
    PAID: "text-[var(--foreground-muted)] bg-[var(--surface-warm)]",
    ENTERPRISE: "text-[var(--foreground-muted)] bg-[var(--surface-warm)]",
    OPEN_SOURCE: "text-blue-600 bg-blue-50",
  };

  return (
    <>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: tool.category.name,
        description: tool.description,
        url: tool.website,
        offers: {
          "@type": "Offer",
          price: tool.pricingTier === 'FREE' ? 0 : undefined,
          priceCurrency: "USD",
        },
      }} />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-[var(--accent)]">Tools</Link>
          <span>/</span>
          <Link href={`/category/${tool.category.slug}`} className="hover:text-[var(--accent)]">
            {tool.category.name}
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">{tool.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <main className="lg:col-span-8">
            {/* Header */}
            <div className="flex items-start gap-5 mb-8 pb-8 border-b border-[var(--border-soft)]">
              <div className="shrink-0">
                <ToolLogo name={tool.name} logo={tool.logo} size="lg" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                  {tool.name}
                </h1>
                <p className="text-lg text-[var(--foreground-muted)] mb-4">{tool.tagline}</p>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Link 
                    href={`/category/${tool.category.slug}`}
                    className="px-3 py-1.5 bg-[var(--surface-warm)] rounded-full text-sm text-[var(--foreground-soft)] 
                             hover:bg-[var(--accent-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    {tool.category.name}
                  </Link>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${pricingColors[tool.pricingTier]}`}>
                    {pricingLabel}
                  </span>
                  {tool.trendingScore > 70 && (
                    <span className="px-3 py-1.5 bg-[var(--accent-muted)] text-[var(--accent)] rounded-full text-sm font-medium">
                      🔥 Trending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick CTA for Mobile */}
            <div className="lg:hidden mb-8">
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
            <section className="mb-10">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">About</h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed text-lg">{tool.description}</p>
              
              {/* Key Highlights */}
              <div className="mt-6 pt-6 border-t border-[var(--border-soft)]">
                <ul className="space-y-2 text-[var(--foreground-muted)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">✓</span>
                    <span>Category: {tool.category.name} AI Tool</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">✓</span>
                    <span>Pricing: {pricingLabel}{tool.hasFreeTier ? ' (Free tier available)' : ''}</span>
                  </li>
                  {tool.githubStars && tool.githubStars > 100 && (
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)]">✓</span>
                      <span>Popular: {tool.githubStars.toLocaleString()}+ GitHub stars</span>
                    </li>
                  )}
                </ul>
              </div>
            </section>

            {/* Features */}
            {tool.features?.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Features</h2>
                <ul className="space-y-2">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 py-2">
                      <span className="text-[var(--accent)] mt-0.5">•</span>
                      <span className="text-[var(--foreground-muted)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Use Cases */}
            {tool.useCases?.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Use Cases</h2>
                <ul className="space-y-2">
                  {tool.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-3 py-2">
                      <span className="text-[var(--accent)]">→</span>
                      <span className="text-[var(--foreground-muted)]">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* FAQ Section */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">FAQ</h2>
              <div className="space-y-3">
                <details className="group">
                  <summary className="flex items-center justify-between py-3 cursor-pointer font-medium text-[var(--foreground)] border-b border-[var(--border-soft)]">
                    What is {tool.name}?
                    <span className="text-[var(--accent)] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="py-3 text-[var(--foreground-muted)]">
                    {tool.description}
                  </div>
                </details>
                
                <details className="group">
                  <summary className="flex items-center justify-between py-3 cursor-pointer font-medium text-[var(--foreground)] border-b border-[var(--border-soft)]">
                    Is {tool.name} free?
                    <span className="text-[var(--accent)] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="py-3 text-[var(--foreground-muted)]">
                    {tool.pricingTier === 'FREE' 
                      ? `Yes, ${tool.name} is completely free to use.`
                      : tool.pricingTier === 'FREEMIUM'
                      ? `Yes, ${tool.name} offers a free tier with basic features. Premium features require a paid subscription.`
                      : tool.pricingTier === 'OPEN_SOURCE'
                      ? `Yes, ${tool.name} is open source and free to use. You can also self-host it.`
                      : `${tool.name} requires a paid subscription. Check their website for current pricing.`}
                  </div>
                </details>
                
                <details className="group">
                  <summary className="flex items-center justify-between py-3 cursor-pointer font-medium text-[var(--foreground)] border-b border-[var(--border-soft)]">
                    What are the best alternatives?
                    <span className="text-[var(--accent)] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="py-3 text-[var(--foreground-muted)]">
                    Some popular alternatives include: {alternativeTools.slice(0, 3).map(t => t.name).join(', ')}. 
                    Explore more {tool.category.name.toLowerCase()} tools on Atooli.
                  </div>
                </details>
              </div>
            </section>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                  Similar {tool.category.name} Tools
                </h2>
                <div className="divide-y divide-[var(--border-soft)]">
                  {relatedTools.map((relatedTool) => (
                    <ToolListItem key={relatedTool.id} tool={relatedTool} />
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* CTA */}
            <div className="p-6 bg-[var(--accent)] rounded-2xl text-center">
              <h3 className="text-white font-semibold mb-3">Try {tool.name}</h3>
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-white text-[var(--foreground)] font-medium rounded-lg hover:bg-[var(--background)] transition-colors"
              >
                Visit Website →
              </a>
              <p className="text-xs text-white/80 mt-3">
                External link opens in new tab
              </p>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">
                Pricing
              </h3>
              
              {tool.pricingPlans && tool.pricingPlans.length > 0 ? (
                <div className="space-y-3">
                  {tool.pricingPlans.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`p-4 rounded-xl border ${
                        plan.isPopular 
                          ? 'border-[var(--accent)] bg-[var(--accent-muted)]' 
                          : 'border-[var(--border-soft)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[var(--foreground)]">{plan.name}</span>
                        {plan.isPopular && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--accent)] text-white rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-[var(--foreground)] mb-2">
                        {plan.price === 0 ? 'Free' : plan.price === null ? 'Custom' : `$${plan.price}/${plan.priceUnit === 'month' ? 'mo' : plan.priceUnit}`}
                      </div>
                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-1">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-xs text-[var(--foreground-muted)] flex items-start gap-1">
                              <span className="text-[var(--accent)]">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[var(--border-soft)]">
                    <span className="text-[var(--foreground-muted)]">Type</span>
                    <span className="text-[var(--foreground)] font-medium">{pricingLabel}</span>
                  </div>
                  {tool.priceStart && (
                    <div className="flex justify-between py-2 border-b border-[var(--border-soft)]">
                      <span className="text-[var(--foreground-muted)]">From</span>
                      <span className="text-[var(--foreground)] font-medium">${tool.priceStart}/mo</span>
                    </div>
                  )}
                  {tool.hasFreeTier && (
                    <div className="flex justify-between py-2 border-b border-[var(--border-soft)]">
                      <span className="text-[var(--foreground-muted)]">Free tier</span>
                      <span className="text-[var(--accent-2)]">✓ Yes</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Metrics */}
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">
                Stats
              </h3>
              <div className="space-y-3 text-sm">
                {tool.githubStars && tool.githubStars > 0 && (
                  <div className="flex justify-between py-2 border-b border-[var(--border-soft)]">
                    <span className="text-[var(--foreground-muted)]">GitHub Stars</span>
                    <span className="text-[var(--foreground)] font-medium">{tool.githubStars.toLocaleString()}</span>
                  </div>
                )}
                {tool.productHuntVotes && tool.productHuntVotes > 0 && (
                  <div className="flex justify-between py-2 border-b border-[var(--border-soft)]">
                    <span className="text-[var(--foreground-muted)]">Product Hunt</span>
                    <span className="text-[var(--foreground)] font-medium">{tool.productHuntVotes}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-[var(--border-soft)]">
                  <span className="text-[var(--foreground-muted)]">Trending</span>
                  <span className="text-[var(--foreground)] font-medium">{tool.trendingScore.toFixed(0)}/100</span>
                </div>
              </div>
            </div>

            {/* Resources */}
            {tool.githubRepo && (
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-3">
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
            <div className="pt-4 border-t border-[var(--border-soft)]">
              <p className="text-xs text-[var(--foreground-muted)]">
                Something wrong?{" "}
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

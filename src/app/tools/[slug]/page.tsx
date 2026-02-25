import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";
import { ToolLogo } from "@/components/ToolLogo";
import Link from "next/link";

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getTool(slug: string) {
  return prisma.tool.findUnique({
    where: { slug },
    include: { category: true },
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
    take: 3,
  });
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  if (!tool) {
    return { title: "Tool Not Found" };
  }
  
  return {
    title: `${tool.name} - ${tool.tagline}`,
    description: tool.description.slice(0, 160),
    alternates: {
      canonical: `/tools/${slug}`,
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "AIApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: tool.priceStart || 0,
      priceCurrency: "USD",
    },
    description: tool.description,
    url: tool.website,
    category: tool.category.name,
    featureList: tool.features,
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
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-8">
            {/* Header Card */}
            <div className="bg-[var(--surface)] rounded-lg p-6 mb-6">
              <div className="flex items-start gap-5">
                <ToolLogo name={tool.name} logo={tool.logo} size="lg" />
                
                <div className="flex-1">
                  <h1 className="text-2xl font-medium text-[var(--foreground)] mb-1">
                    {tool.name}
                  </h1>
                  <p className="text-[var(--muted)] mb-3">{tool.tagline}</p>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs text-[var(--muted)]"
                    >
                      {tool.category.name}
                    </span>
                    <span className="px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs"
                    >
                      {pricingLabel}
                    </span>
                    {tool.trendingScore > 50 && (
                      <span className="px-2.5 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded text-xs text-[var(--accent)]"
                      >
                        Trending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="mb-8">
              <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
                About
              </h2>
              <p className="text-[var(--foreground)] leading-relaxed">{tool.description}</p>
            </section>

            {/* Features */}
            {tool.features?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
                  Features
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span className="text-[var(--foreground)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Use Cases */}
            {tool.useCases?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
                  Use Cases
                </h2>
                <ul className="space-y-2">
                  {tool.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span className="text-[var(--foreground)]">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
                  Similar Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-[var(--background)] text-[var(--foreground)] text-center font-medium rounded hover:bg-[var(--surface)] transition-colors"
              >
                Visit Website →
              </a>
              <p className="text-xs text-[var(--background)]/80 text-center mt-3">
                External link, opens in new tab
              </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-[var(--surface)] rounded-lg p-5">
              <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
                Pricing
              </h3>
              
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
            </div>

            {/* Metrics Card */}
            <div className="bg-[var(--surface)] rounded-lg p-5">
              <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
                Metrics
              </h3>
              
              <div className="space-y-3">
                {tool.githubStars && tool.githubStars > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">GitHub Stars</span>
                    <span className="text-[var(--foreground)]">{tool.githubStars.toLocaleString()}</span>
                  </div>
                )}
                
                {tool.productHuntVotes && tool.productHuntVotes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Product Hunt</span>
                    <span className="text-[var(--foreground)]">{tool.productHuntVotes}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Trending</span>
                  <span className="text-[var(--foreground)]">{tool.trendingScore.toFixed(0)}/100</span>
                </div>
              </div>
            </div>

            {/* Report */}
            <div className="border border-[var(--border)] rounded-lg p-4">
              <p className="text-xs text-[var(--muted)] text-center">
                Something wrong with this listing?{" "}
                <a href="mailto:hello@tooli.ai" className="text-[var(--accent)] hover:underline">
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

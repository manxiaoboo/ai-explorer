import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";
import { ToolLogo } from "@/components/ToolLogo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trending - Atooli",
  description: "The hottest AI tools right now. Ranked by real activity across GitHub, Product Hunt, and community engagement.",
  alternates: {
    canonical: "/trending",
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTrendingTools() {
  return prisma.tool.findMany({
    where: { isActive: true },
    orderBy: { trendingScore: "desc" },
    take: 30,
    include: { category: true },
  });
}

const pricingLabels: Record<string, string> = {
  FREE: "Free",
  FREEMIUM: "Freemium", 
  PAID: "Paid",
  ENTERPRISE: "Enterprise",
  OPEN_SOURCE: "Open Source",
};

const pricingColors: Record<string, string> = {
  FREE: "text-[var(--accent-2)] bg-[var(--accent-2-muted)]",
  FREEMIUM: "text-[#b8860b] bg-[var(--accent-3-muted)]",
  PAID: "text-[var(--foreground-muted)] bg-[var(--surface-warm)]",
  ENTERPRISE: "text-[var(--foreground-muted)] bg-[var(--surface-warm)]",
  OPEN_SOURCE: "text-blue-600 bg-blue-50",
};

export default async function TrendingPage() {
  const tools = await getTrendingTools();

  const top3 = tools.slice(0, 3);
  const rest = tools.slice(3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trending AI Tools",
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://tooli.ai/tools/${tool.slug}`,
      name: tool.name,
    })),
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-4">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            <span>/</span>
            <span className="text-[var(--foreground)]">Trending</span>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                Trending
              </h1>
              <p className="text-[var(--foreground-muted)]">
                The hottest tools right now. Updated daily.
              </p>
            </div>
            
            <div className="text-right hidden sm:block">
              <div className="text-sm text-[var(--foreground-muted)] mb-1">Ranked by activity</div>
              <div className="text-xs text-[var(--foreground-muted)]">GitHub · Product Hunt · Community</div>
            </div>
          </div>
        </header>

        {/* Top 3 Podium */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="order-2 md:order-1">
                <Link 
                  href={`/tools/${top3[1].slug}`}
                  className="group block text-center py-8 px-4 rounded-2xl border border-[var(--border)] 
                             hover:border-[var(--accent)]/30 hover:bg-[var(--surface-warm)] transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-[var(--foreground-muted)] mb-4">2</div>
                  <div className="w-16 h-16 mx-auto mb-4">
                    <ToolLogo name={top3[1].name} logo={top3[1].logo} size="lg" />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] truncate">
                    {top3[1].name}
                  </h3>
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${pricingColors[top3[1].pricingTier]}`}>
                    {pricingLabels[top3[1].pricingTier]}
                  </span>
                </Link>
              </div>
            )}
            
            {/* 1st Place */}
            {top3[0] && (
              <div className="order-1 md:order-2">
                <Link 
                  href={`/tools/${top3[0].slug}`}
                  className="group block text-center py-10 px-4 rounded-2xl border-2 border-[var(--accent)]/30 
                             bg-gradient-to-b from-[var(--accent-muted)] to-transparent
                             hover:border-[var(--accent)] transition-all duration-300"
                >
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--accent)] text-white text-xs font-bold rounded-full mb-4">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    #1
                  </div>
                  
                  <div className="w-20 h-20 mx-auto mb-4">
                    <ToolLogo name={top3[0].name} logo={top3[0].logo} size="lg" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] truncate">
                    {top3[0].name}
                  </h3>                    
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">{top3[0].category.name}</p>
                  <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full ${pricingColors[top3[0].pricingTier]}`}>
                    {pricingLabels[top3[0].pricingTier]}
                  </span>
                </Link>
              </div>
            )}
            
            {/* 3rd Place */}
            {top3[2] && (
              <div className="order-3">
                <Link 
                  href={`/tools/${top3[2].slug}`}
                  className="group block text-center py-8 px-4 rounded-2xl border border-[var(--border)] 
                             hover:border-[var(--accent)]/30 hover:bg-[var(--surface-warm)] transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-[var(--accent-3)] mb-4">3</div>
                  <div className="w-16 h-16 mx-auto mb-4">
                    <ToolLogo name={top3[2].name} logo={top3[2].logo} size="lg" />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] truncate">
                    {top3[2].name}
                  </h3>
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${pricingColors[top3[2].pricingTier]}`}>
                    {pricingLabels[top3[2].pricingTier]}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the list */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-soft)]">
            <h2 className="font-bold text-[var(--foreground)]">Rankings</h2>
            <span className="text-sm text-[var(--foreground-muted)]">{rest.length} more tools</span>
          </div>
          
          <div className="divide-y divide-[var(--border-soft)]">
            {rest.map((tool, index) => {
              const rank = index + 4;
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group flex items-center gap-4 py-4 px-4 -mx-4 rounded-xl hover:bg-[var(--surface-warm)] transition-colors"
                >
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    <span className="text-lg font-bold text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]">
                      {rank}
                    </span>
                  </div>
                  
                  {/* Logo */}
                  <div className="shrink-0">
                    <ToolLogo name={tool.name} logo={tool.logo} size="md" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] truncate">
                        {tool.name}
                      </h3>
                      <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${pricingColors[tool.pricingTier]}`}>
                        {pricingLabels[tool.pricingTier]}
                      </span>
                    </div>                    
                    <p className="text-sm text-[var(--foreground-muted)] truncate">
                      {tool.tagline}
                    </p>
                  </div>
                  
                  {/* Category */}
                  <div className="hidden sm:block text-sm text-[var(--foreground-muted)] shrink-0">
                    {tool.category.name}
                  </div>
                  
                  {/* Arrow */}
                  <svg className="w-5 h-5 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 
                                 group-hover:translate-x-1 transition-all shrink-0 hidden sm:block"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Ranking Methodology - Open Design */}
        <div className="pt-8 border-t border-[var(--border-soft)]">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-bold text-[var(--foreground)]">How rankings work</h3>
          </div>
          
          <p className="text-[var(--foreground-muted)] mb-6">
            Our trending score combines multiple signals to surface the most relevant AI tools:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "⭐", title: "GitHub Stars", desc: "Open source popularity" },
              { icon: "🔥", title: "Product Hunt", desc: "Community votes and buzz" },
              { icon: "⚡", title: "Growth Rate", desc: "Recent momentum" },
              { icon: "✓", title: "Quality", desc: "Documentation and maturity" },
              { icon: "♥", title: "Engagement", desc: "Clicks and saves" },
              { icon: "◷", title: "Freshness", desc: "New and updated tools" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="font-medium text-[var(--foreground)] text-sm">{item.title}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";
import { ToolLogo } from "@/components/ToolLogo";
import { HeroSearch } from "@/components/HeroSearch";
import type { Tool, Category, Prisma } from "@prisma/client";

// Type for tool with category relation
type ToolWithCategory = Tool & { category: Category };

export const metadata: Metadata = {
  title: "Atooli - AI Tools Directory",
  description: "500+ AI tools, hand-picked and categorized. Find the perfect tool for writing, images, code, and more.",
  alternates: {
    canonical: "/",
  },
};

export const dynamic = 'force-dynamic';

async function queryWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

async function getToolsByCategory(): Promise<Record<string, ToolWithCategory[]>> {
  const allTools = await queryWithRetry(() =>
    prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { trendingScore: "desc" },
      take: 150,
      include: { category: true },
    })
  );
  
  const grouped: Record<string, ToolWithCategory[]> = {};
  
  for (const tool of allTools) {
    const categoryName = tool.category.name;
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    if (grouped[categoryName].length < 3) {
      grouped[categoryName].push(tool);
    }
  }
  
  const categories = await queryWithRetry(() =>
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { name: true }
    })
  );
  
  const result: Record<string, ToolWithCategory[]> = {};
  for (const cat of categories) {
    if (grouped[cat.name] && grouped[cat.name].length >= 3) {
      result[cat.name] = grouped[cat.name];
    }
  }
  
  return result;
}

async function getTrendingTools() {
  return queryWithRetry(() =>
    prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { trendingScore: "desc" },
      take: 5,
      include: { category: true },
    })
  );
}

async function getFeaturedTools() {
  return queryWithRetry(() =>
    prisma.tool.findMany({
      where: { isFeatured: true, isActive: true },
      orderBy: { trendingScore: "desc" },
      take: 3,
      include: { category: true },
    })
  );
}

async function getCategories() {
  return queryWithRetry(() =>
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    })
  );
}

const pricingLabels: Record<string, string> = {
  FREE: "Free",
  FREEMIUM: "Freemium",
  PAID: "Paid",
  ENTERPRISE: "Enterprise",
  OPEN_SOURCE: "Open Source",
};

const pricingColors: Record<string, string> = {
  FREE: "bg-[var(--accent-2-muted)] text-[var(--accent-2)]",
  FREEMIUM: "bg-[var(--accent-3-muted)] text-[#b8860b]",
  PAID: "bg-[var(--surface-soft)] text-[var(--foreground-muted)]",
  ENTERPRISE: "bg-[var(--surface-soft)] text-[var(--foreground-muted)]",
  OPEN_SOURCE: "bg-blue-50 text-blue-600",
};

function isTrendingTool(trendingScore: number): boolean {
  return trendingScore > 80;
}

function isNewTool(createdAt: Date): boolean {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return new Date(createdAt) > threeDaysAgo;
}

// Warm Tool Card with organic feel
function CompactToolCard({ tool }: { tool: ToolWithCategory }) {
  const isTrending = isTrendingTool(tool.trendingScore);
  
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group block bg-white rounded-2xl border border-[var(--border)] p-4
                 hover:border-[var(--accent-soft)] hover:shadow-xl hover:shadow-[var(--accent)]/5
                 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <ToolLogo name={tool.name} logo={tool.logo} size="md" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] truncate text-sm">
              {tool.name}
            </h3>
            {isTrending && (
              <span className="text-xs" title="Trending">🔥</span>
            )}
            {isNewTool(tool.createdAt) && (
              <span className="text-[10px] px-2 py-0.5 bg-[var(--accent-2-muted)] text-[var(--accent-2)] rounded-full font-medium">
                New
              </span>
            )}
          </div>
          
          <p className="text-xs text-[var(--foreground-muted)] line-clamp-2 mb-3 leading-relaxed">
            {tool.tagline}
          </p>
          
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${pricingColors[tool.pricingTier]}`}>
            {pricingLabels[tool.pricingTier]}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  let toolsByCategory: Record<string, ToolWithCategory[]> = {};
  let trendingTools: ToolWithCategory[] = [];
  let featuredTools: ToolWithCategory[] = [];
  let categories: Category[] = [];
  
  try {
    [toolsByCategory, trendingTools, featuredTools, categories] = await Promise.all([
      getToolsByCategory(),
      getTrendingTools(),
      getFeaturedTools(),
      getCategories(),
    ]);
  } catch (error) {
    console.error('Failed to load data:', error);
  }

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Atooli",
    url: "https://tooli.ai",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://tooli.ai/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <StructuredData data={websiteStructuredData} />

      {/* Hero Section - Warm Organic Feel */}
      <section className="relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[var(--accent-3)]/20 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-20 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--accent-2)]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative bg-gradient-to-b from-[var(--background-warm)] via-[var(--background)] to-[var(--background)]">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              {/* Logo Badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-full shadow-sm border border-[var(--border-soft)]">
                <span className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[var(--accent)]/20">
                  T
                </span>
                <span className="text-sm font-medium text-[var(--foreground-soft)]">Atooli</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-5 leading-tight">
                Discover the perfect
                <span className="block mt-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] bg-clip-text text-transparent">
                  AI tool for you
                </span>
              </h1>

              <p className="text-lg text-[var(--foreground-muted)] mb-8 leading-relaxed">
                500+ carefully curated AI tools, organized by category. 
                Find exactly what you need for writing, images, code, and more.
              </p>

              {/* Search Box */}
              <div className="mb-8">
                <HeroSearch />
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  href="/tools"
                  className="px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-full 
                           hover:bg-[var(--accent-hover)] transition-all duration-200
                           shadow-lg shadow-[var(--accent)]/25 hover:shadow-xl hover:shadow-[var(--accent)]/30
                           hover:-translate-y-0.5"
                >
                  Browse all tools
                </Link>
                
                <Link
                  href="/submit"
                  className="px-6 py-3 bg-white text-[var(--foreground)] font-medium rounded-full 
                           border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]
                           hover:bg-[var(--accent-muted)] transition-all duration-200"
                >
                  Submit a tool
                </Link>
              </div>

              {/* Popular Tags - Pill Style */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-[var(--foreground-muted)] mr-1">Popular:</span>
                {['Writing', 'Image', 'Code', 'Chat', 'Video', 'Free'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/tools?category=${tag.toLowerCase()}`}
                    className="px-4 py-1.5 text-sm text-[var(--foreground-soft)] bg-white 
                             border border-[var(--border-soft)] rounded-full 
                             hover:border-[var(--accent-soft)] hover:text-[var(--accent)] 
                             hover:bg-[var(--accent-muted)] transition-all duration-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content - Tools by Category */}
          <main className="lg:col-span-9">
            {Object.entries(toolsByCategory).map(([categoryName, tools]) => (
              <section key={categoryName} className="mb-12">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-[var(--foreground)]">
                    {categoryName}
                  </h2>
                  <Link 
                    href={`/tools?category=${tools[0]?.category.slug || categoryName.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] 
                             flex items-center gap-1 transition-colors"
                  >
                    View all 
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                
                {/* 3-Column Grid with larger gap */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tools.map((tool) => (
                    <CompactToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            ))}
          </main>

          {/* Sidebar - Warm Cards */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Featured - Top 3 Trending */}
            {featuredTools.length > 0 && (
              <div className="bg-gradient-to-br from-[var(--accent-muted)] to-[var(--accent-3-muted)] 
                            rounded-2xl border border-[var(--accent-soft)]/30 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🔥</span>
                  <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                    Top Trending
                  </span>
                </div>
                
                <div className="space-y-4">
                  {featuredTools.map((tool, index) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      className="group block"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-xl ${
                          index === 0 ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30' :
                          index === 1 ? 'bg-[var(--accent-soft)] text-white' :
                          'bg-white text-[var(--accent)] border border-[var(--accent-soft)]'
                        }`}>
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <ToolLogo name={tool.name} logo={tool.logo} size="sm" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] truncate transition-colors">
                                {tool.name}
                              </h3>
                              <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">{tool.tagline}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Mini - Warm Card */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📈</span>
                  <h3 className="font-bold text-[var(--foreground)] text-sm">Trending Now</h3>
                </div>
                <Link href="/trending" className="text-xs text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors">
                  View all →
                </Link>
              </div>
              
              <div className="space-y-3">
                {trendingTools.slice(0, 5).map((tool, index) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <span className={`w-6 text-center text-sm font-bold ${
                      index < 3 ? 'text-[var(--accent)]' : 'text-[var(--foreground-muted)]'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] truncate transition-colors">
                        {tool.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories - Warm Tags */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
              <h3 className="font-bold text-[var(--foreground)] mb-4 text-sm">Categories</h3>
              
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tools?category=${cat.slug}`}
                    className="px-3 py-1.5 text-xs text-[var(--foreground-soft)] 
                             bg-[var(--surface-warm)] hover:bg-[var(--accent-muted)] 
                             hover:text-[var(--accent)] rounded-full 
                             border border-transparent hover:border-[var(--accent-soft)]
                             transition-all duration-200"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats - Warm Dark Card */}
            <div className="bg-[var(--foreground)] rounded-2xl p-6 text-white relative overflow-hidden">
              {/* Subtle glow effect */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent)]/20 rounded-full blur-2xl" />
              
              <div className="relative text-center mb-5">
                <div className="text-4xl font-bold mb-1">500+</div>
                <div className="text-sm text-white/60">Tools curated</div>
              </div>
              
              <Link
                href="/submit"
                className="block w-full py-3 bg-[var(--accent)] text-white text-center text-sm font-medium 
                         rounded-xl hover:bg-[var(--accent-soft)] transition-colors
                         shadow-lg shadow-[var(--accent)]/30"
              >
                Submit a tool
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

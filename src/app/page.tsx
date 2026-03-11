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
    if (grouped[categoryName].length < 5) {
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
      take: 8,
      include: { category: true },
    })
  );
}

async function getFeaturedTools() {
  return queryWithRetry(() =>
    prisma.tool.findMany({
      where: { isFeatured: true, isActive: true },
      orderBy: { trendingScore: "desc" },
      take: 5,
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
  FREE: "text-[var(--accent-2)]",
  FREEMIUM: "text-[#b8860b]",
  PAID: "text-[var(--foreground-muted)]",
  ENTERPRISE: "text-[var(--foreground-muted)]",
  OPEN_SOURCE: "text-blue-600",
};

function isTrendingTool(trendingScore: number): boolean {
  return trendingScore > 80;
}

function isNewTool(createdAt: Date): boolean {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return new Date(createdAt) > threeDaysAgo;
}

// Open List Item - No card, just clean row
function ToolListItem({ tool, index }: { tool: ToolWithCategory; index: number }) {
  const isTrending = isTrendingTool(tool.trendingScore);
  
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-center gap-4 py-4 px-4 -mx-4 rounded-xl
                 hover:bg-[var(--surface-warm)] transition-all duration-200"
    >
      {/* Number */}
      <span className="w-6 text-center text-sm text-[var(--foreground-muted)] font-medium">
        {index + 1}
      </span>
      
      {/* Logo */}
      <div className="shrink-0">
        <ToolLogo name={tool.name} logo={tool.logo} size="md" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
            {tool.name}
          </h3>
          {isNewTool(tool.createdAt) && (
            <span className="text-[10px] px-2 py-0.5 bg-[var(--accent-2-muted)] text-[var(--accent-2)] rounded-full font-medium">
              New
            </span>
          )}
          {isTrending && (
            <span className="text-xs" title="Trending">🔥</span>
          )}
        </div>
        <p className="text-sm text-[var(--foreground-muted)] truncate">
          {tool.tagline}
        </p>
      </div>
      
      {/* Pricing - subtle text */}
      <span className={`text-xs font-medium ${pricingColors[tool.pricingTier]} hidden sm:block`}>
        {pricingLabels[tool.pricingTier]}
      </span>
      
      {/* Arrow on hover */}
      <svg 
        className="w-5 h-5 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 
                   group-hover:translate-x-1 transition-all duration-200 hidden sm:block"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// Featured Item - Larger, more prominent but still open
function FeaturedItem({ tool, rank }: { tool: ToolWithCategory; rank: number }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-start gap-4 py-5 px-4 -mx-4 rounded-xl
                 hover:bg-[var(--accent-muted)] transition-all duration-200"
    >
      {/* Rank Badge */}
      <span className={`shrink-0 w-10 h-10 flex items-center justify-center text-lg font-bold rounded-xl
        ${rank === 1 ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30' :
          rank === 2 ? 'bg-[var(--accent-soft)] text-white' :
          rank === 3 ? 'bg-[var(--accent-3)] text-[var(--foreground)]' :
          'bg-[var(--surface-warm)] text-[var(--foreground-muted)]'}`}>
        {rank}
      </span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <ToolLogo name={tool.name} logo={tool.logo} size="sm" />
          <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
            {tool.name}
          </h3>
        </div>
        <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
          {tool.tagline}
        </p>
      </div>
    </Link>
  );
}

// Simple trending row
function TrendingRow({ tool, index }: { tool: ToolWithCategory; index: number }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-center gap-3 py-2.5 hover:opacity-70 transition-opacity"
    >
      <span className={`w-5 text-sm font-bold ${index < 3 ? 'text-[var(--accent)]' : 'text-[var(--foreground-muted)]'}`}>
        {index + 1}
      </span>
      <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] truncate transition-colors">
        {tool.name}
      </span>
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

      {/* Hero Section - Clean & Open */}
      <section className="relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-3-muted)]/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-2xl">
            {/* Simple Logo */}
            <div className="inline-flex items-center gap-2 mb-6 text-[var(--foreground-soft)]">
              <span className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                T
              </span>
              <span className="text-sm font-medium">Atooli</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-5 leading-tight">
              Discover the perfect
              <span className="block mt-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] bg-clip-text text-transparent">
                AI tool for you
              </span>
            </h1>

            <p className="text-lg text-[var(--foreground-muted)] mb-8 leading-relaxed max-w-xl">
              500+ carefully curated AI tools, organized by category. 
              Find exactly what you need for writing, images, code, and more.
            </p>

            {/* Search Box */}
            <div className="mb-8">
              <HeroSearch />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                href="/tools"
                className="px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-full 
                         hover:bg-[var(--accent-hover)] transition-all duration-200
                         shadow-lg shadow-[var(--accent)]/25"
              >
                Browse all tools
              </Link>
              
              <Link
                href="/submit"
                className="px-6 py-3 text-[var(--foreground)] font-medium rounded-full 
                         hover:bg-[var(--surface-warm)] transition-all duration-200"
              >
                Submit a tool
              </Link>
            </div>

            {/* Popular Tags - Inline text style */}
            <div className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm text-[var(--foreground-muted)]">
              <span>Popular:</span>
              {['Writing', 'Image', 'Code', 'Chat', 'Video'].map((tag, i) => (
                <span key={tag}>
                  <Link
                    href={`/tools?category=${tag.toLowerCase()}`}
                    className="text-[var(--foreground-soft)] hover:text-[var(--accent)] transition-colors"
                  >
                    {tag}
                  </Link>
                  {i < 4 && <span className="text-[var(--border)]">,</span>}
                </span>
              ))}
              <Link href="/tools" className="text-[var(--accent)] hover:underline ml-1">
                all categories →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Open Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column - Tools by Category */}
          <main className="lg:col-span-8">
            {Object.entries(toolsByCategory).slice(0, 6).map(([categoryName, tools]) => (
              <section key={categoryName} className="mb-12">
                {/* Category Header - Clean */}
                <div className="flex items-center justify-between mb-2 pb-3 border-b border-[var(--border-soft)]">
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    {categoryName}
                  </h2>
                  <Link 
                    href={`/tools?category=${tools[0]?.category.slug || categoryName.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    View all
                  </Link>
                </div>
                
                {/* Tools List - No cards, just rows */}
                <div className="divide-y divide-[var(--border-soft)]">
                  {tools.map((tool, index) => (
                    <ToolListItem key={tool.id} tool={tool} index={index} />
                  ))}
                </div>
              </section>
            ))}
            
            {/* Browse All CTA */}
            <div className="mt-16 text-center">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--foreground)] text-white 
                         font-medium rounded-full hover:bg-[var(--foreground)]/90 transition-all duration-200"
              >
                Browse all 500+ tools
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </main>

          {/* Right Column - Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            
            {/* Featured Section */}
            {featuredTools.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🔥</span>
                  <h3 className="font-bold text-[var(--foreground)]">Top Trending</h3>
                </div>
                
                <div className="divide-y divide-[var(--border-soft)]">
                  {featuredTools.slice(0, 5).map((tool, index) => (
                    <FeaturedItem key={tool.id} tool={tool} rank={index + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Trending Mini */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📈</span>
                  <h3 className="font-bold text-[var(--foreground)]">Trending Now</h3>
                </div>
                <Link href="/trending" className="text-sm text-[var(--accent)] hover:underline">
                  View all
                </Link>
              </div>
              
              <div className="divide-y divide-[var(--border-soft)]">
                {trendingTools.slice(0, 6).map((tool, index) => (
                  <TrendingRow key={tool.id} tool={tool} index={index} />
                ))}
              </div>
            </div>

            {/* Categories - Simple list */}
            <div>
              <h3 className="font-bold text-[var(--foreground)] mb-4">Categories</h3>
              
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 12).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tools?category=${cat.slug}`}
                    className="px-3 py-1.5 text-sm text-[var(--foreground-soft)] 
                             bg-[var(--surface-warm)] hover:bg-[var(--accent-muted)] 
                             hover:text-[var(--accent)] rounded-full transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              
              <Link 
                href="/tools" 
                className="inline-block mt-4 text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
              >
                View all categories →
              </Link>
            </div>

            {/* Submit CTA - No card, just styled section */}
            <div className="pt-6 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--foreground-muted)] mb-4">
                Have an AI tool to share?
              </p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white 
                         text-sm font-medium rounded-full hover:bg-[var(--accent-hover)] transition-colors"
              >
                Submit a tool
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>

            {/* Stats - Simple text */}
            <div className="pt-6 border-t border-[var(--border)]">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[var(--foreground)]">500+</span>
                <span className="text-sm text-[var(--foreground-muted)]">tools curated</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

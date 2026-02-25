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
  title: "Tooli - AI Tools Directory",
  description: "500+ AI tools, hand-picked and categorized. Find the perfect tool for writing, images, code, and more.",
  alternates: {
    canonical: "/",
  },
};

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

// Get tools grouped by category (3 per category)
async function getToolsByCategory(): Promise<Record<string, ToolWithCategory[]>> {
  const categories = await queryWithRetry(() =>
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    })
  );
  
  const result: Record<string, ToolWithCategory[]> = {};
  
  for (const category of categories) {
    const tools = await queryWithRetry(() =>
      prisma.tool.findMany({
        where: { 
          isActive: true,
          categoryId: category.id,
        },
        orderBy: { trendingScore: "desc" },
        take: 3,
        include: { category: true },
      })
    );
    
    // Only include categories with at least 3 tools
    if (tools.length >= 3) {
      result[category.name] = tools;
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
      take: 1,
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

// Check if tool is trending
function isTrendingTool(trendingScore: number): boolean {
  return trendingScore > 80;
}

// Check if tool is new (added within 3 days)
function isNewTool(createdAt: Date): boolean {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return new Date(createdAt) > threeDaysAgo;
}

// Compact Tool Card for grid layout
function CompactToolCard({ tool }: { tool: ToolWithCategory }) {
  const isTrending = isTrendingTool(tool.trendingScore);
  
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group block bg-white rounded-lg border border-slate-200 p-3
                 hover:border-orange-300 hover:shadow-md
                 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <ToolLogo name={tool.name} logo={tool.logo} size="sm" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-medium text-slate-900 group-hover:text-orange-600 truncate text-sm">
              {tool.name}
            </h3>
            {isTrending && (
              <span className="text-[10px] text-orange-500">🔥</span>
            )}
            {isNewTool(tool.createdAt) && (
              <span className="text-[10px] px-1 bg-green-100 text-green-700 rounded">NEW</span>
            )}
          </div>
          
          <p className="text-xs text-slate-500 line-clamp-2 mb-2">
            {tool.tagline}
          </p>
          
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            tool.pricingTier === 'FREE' ? 'text-emerald-600 bg-emerald-50' :
            tool.pricingTier === 'FREEMIUM' ? 'text-amber-600 bg-amber-50' :
            tool.pricingTier === 'OPEN_SOURCE' ? 'text-sky-600 bg-sky-50' :
            'text-slate-600 bg-slate-100'
          }`}>
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
    name: "Tooli",
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

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50/50 to-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</span>
              <span className="text-sm font-medium text-slate-500">Tooli</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              500+ AI tools,
              <br />
              <span className="text-orange-600">hand-picked and categorized</span>
            </h1>

            <p className="text-lg text-slate-600 mb-6">
              Find the perfect tool for writing, images, code, and more. Updated daily.
            </p>

            {/* Search Box */}
            <div className="mb-6">
              <HeroSearch />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/tools"
                className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Browse all tools
              </Link>
              
              <Link
                href="/submit"
                className="px-5 py-2.5 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                Submit a tool
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-6">
              <span className="text-sm text-slate-500">Popular:</span>
              {['Writing', 'Image', 'Code', 'Chat', 'Free'].map((tag) => (
                <Link
                  key={tag}
                  href={`/tools?category=${tag.toLowerCase()}`}
                  className="px-3 py-1 text-sm text-slate-600 bg-white border border-slate-200 rounded-full hover:border-orange-300 hover:text-orange-600 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Tools by Category */}
          <main className="lg:col-span-9">
            {Object.entries(toolsByCategory).map(([categoryName, tools]) => (
              <section key={categoryName} className="mb-8">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {categoryName}
                  </h2>
                  <Link 
                    href={`/tools?category=${tools[0]?.category.slug || categoryName.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-slate-400 hover:text-orange-600"
                  >
                    View all →
                  </Link>
                </div>
                
                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tools.map((tool) => (
                    <CompactToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            ))}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Featured Highlight */}
            {featuredTools[0] && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">⭐</span>
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Editor&apos;s Pick</span>
                </div>
                
                <Link
                  href={`/tools/${featuredTools[0].slug}`}
                  className="group block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ToolLogo name={featuredTools[0].name} logo={featuredTools[0].logo} size="sm" />
                    <div>
                      <h3 className="font-medium text-sm text-slate-900 group-hover:text-orange-600 truncate">
                        {featuredTools[0].name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">{featuredTools[0].tagline}</p>
                  
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                    Check it out →
                  </span>
                </Link>
              </div>
            )}

            {/* Trending Mini */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔥</span>
                  <h3 className="font-semibold text-slate-900 text-sm">Trending</h3>
                </div>
                <Link href="/trending" className="text-xs text-slate-500 hover:text-orange-600">View all →</Link>
              </div>
              
              <div className="space-y-2">
                {trendingTools.slice(0, 5).map((tool, index) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center gap-2 group"
                  >
                    <span className={`w-5 text-center text-xs font-bold ${
                      index < 3 ? 'text-orange-500' : 'text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs text-slate-900 group-hover:text-orange-600 truncate">
                        {tool.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Categories</h3>
              
              <div className="flex flex-wrap gap-1.5">
                {categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tools?category=${cat.slug}`}
                    className="px-2 py-1 text-xs text-slate-600 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-900 rounded-xl p-4 text-white">
              <div className="text-center mb-3">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs text-slate-400">Tools curated</div>
              </div>
              
              <Link
                href="/submit"
                className="block w-full py-2 bg-white text-slate-900 text-center text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
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

import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";
import { ToolLogo } from "@/components/ToolLogo";
import type { Tool, Category } from "@prisma/client";

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

async function getLatestTools() {
  return queryWithRetry(() =>
    prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { category: true },
    })
  );
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

// Generate gradient based on tool name
function getGradient(name: string): string {
  const gradients = [
    "from-orange-400/20 to-amber-500/20",
    "from-blue-400/20 to-cyan-500/20",
    "from-emerald-400/20 to-teal-500/20",
    "from-violet-400/20 to-purple-500/20",
    "from-rose-400/20 to-pink-500/20",
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

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

export default async function HomePage() {
  let latestTools: Tool[] = [];
  let trendingTools: Tool[] = [];
  let featuredTools: Tool[] = [];
  let categories: Category[] = [];
  
  try {
    [latestTools, trendingTools, featuredTools, categories] = await Promise.all([
      getLatestTools(),
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

      {/* Hero Section - Above the Fold */}
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
          {/* Main Content */}
          <main className="lg:col-span-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Latest Tools</h2>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Updated today</span>
              </div>
              
              <Link 
                href="/tools" 
                className="text-sm text-slate-500 hover:text-orange-600 flex items-center gap-1"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Tool List */}
            <div className="space-y-3">
              {latestTools.map((tool) => {
                const isTrending = isTrendingTool(tool.trendingScore);
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="group relative block bg-white rounded-xl border border-slate-200
                               hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/50
                               hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  >
                    {/* Trending badge */}
                    {isTrending && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium
                                         bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-sm">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          Trending
                        </span>
                      </div>
                    )}

                    <div className="flex items-stretch">
                      {/* Logo */}
                      <div className="w-20 sm:w-24 flex-shrink-0 bg-slate-50 flex items-center justify-center
                                      group-hover:bg-slate-100 transition-colors duration-300">
                        <ToolLogo name={tool.name} logo={tool.logo} size="md" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 min-w-0 pr-20">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 truncate">
                              {tool.name}
                            </h3>

                            {isNewTool(tool.createdAt) && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                                NEW
                              </span>
                            )}

                            {tool.isFeatured && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                                ⭐ PICK
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-1 mb-3">
                          {tool.tagline}
                        </p>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            tool.pricingTier === 'FREE' ? 'text-emerald-600 bg-emerald-50' :
                            tool.pricingTier === 'FREEMIUM' ? 'text-amber-600 bg-amber-50' :
                            tool.pricingTier === 'OPEN_SOURCE' ? 'text-sky-600 bg-sky-50' :
                            'text-slate-600 bg-slate-100'
                          }`}>
                            {pricingLabels[tool.pricingTier]}
                          </span>

                          <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            {tool.category.name}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center pr-4">
                        <span className="text-slate-300 group-hover:text-orange-500
                                         group-hover:translate-x-1 transition-all duration-200">
                          →
                        </span>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500
                                    transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    />
                  </Link>
                );
              })}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Featured Highlight */}
            {featuredTools[0] && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⭐</span>
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Editor&apos;s Pick</span>
                </div>
                
                <Link
                  href={`/tools/${featuredTools[0].slug}`}
                  className="group block"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <ToolLogo name={featuredTools[0].name} logo={featuredTools[0].logo} size="md" />
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">
                        {featuredTools[0].name}
                      </h3>
                      <span className="text-xs text-slate-500">{featuredTools[0].category.name}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3">{featuredTools[0].tagline}</p>
                  
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600"
                  >
                    Check it out
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            )}

            {/* Trending Mini */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <h3 className="font-semibold text-slate-900">Trending</h3>
                </div>
                <Link href="/trending" className="text-xs text-slate-500 hover:text-orange-600">View all →</Link>
              </div>
              
              <div className="space-y-3">
                {trendingTools.map((tool, index) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <span className={`w-6 text-center text-sm font-bold ${
                      index < 3 ? 'text-orange-500' : 'text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900 group-hover:text-orange-600 truncate">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-500">{tool.category.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Categories</h3>
              
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tools?category=${cat.slug}`}
                    className="px-3 py-1.5 text-sm text-slate-600 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                  >
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-900 rounded-xl p-5 text-white">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-slate-400">Tools curated</div>
              </div>
              
              <Link
                href="/submit"
                className="block w-full py-2.5 bg-white text-slate-900 text-center font-medium rounded-lg hover:bg-slate-100 transition-colors"
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

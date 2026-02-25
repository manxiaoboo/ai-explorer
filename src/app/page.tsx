import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Tooli - AI Tools Directory",
  description: "Discover the best AI tools. Browse 500+ tools across writing, image, code, and more. Updated daily.",
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
      take: 10,
      include: { category: true },
    })
  );
}

async function getTrendingTools() {
  return queryWithRetry(() =>
    prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { trendingScore: "desc" },
      take: 10,
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

export default async function HomePage() {
  let latestTools: any[] = [];
  let trendingTools: any[] = [];
  let featuredTools: any[] = [];
  let categories: any[] = [];
  
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
      
      {/* Minimal Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold">T</div>
            <span className="font-semibold text-slate-900">Tooli</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/tools" className="text-sm text-slate-600 hover:text-slate-900">All Tools</Link>
            <Link href="/trending" className="text-sm text-slate-600 hover:text-slate-900">Trending</Link>
            <Link href="/free-ai-tools" className="text-sm text-slate-600 hover:text-slate-900">Free</Link>
            <Link href="/submit" className="text-sm text-slate-600 hover:text-slate-900">Submit</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Tool Feed */}
          <main className="lg:col-span-8">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
              <button className="px-4 py-3 text-sm font-medium text-slate-900 border-b-2 border-slate-900">
                Latest
              </button>
              <Link 
                href="/trending" 
                className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Trending
              </Link>
              <Link 
                href="/free-ai-tools"
                className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Free
              </Link>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Link 
                href="/tools"
                className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-full"
              >
                All
              </Link>
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/tools?category=${cat.slug}`}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Tool List */}
            <div className="space-y-3">
              {latestTools.map((tool, index) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-orange-300 hover:shadow-sm transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl font-bold text-slate-600"
                  >
                    {tool.name[0]}
                  </div>
                  
                  <div className="flex-1 min-w-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 truncate">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">{tool.tagline}</p>
                      </div>
                      
                      <span className="flex-shrink-0 text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                        {pricingLabels[tool.pricingTier]}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{tool.category.name}</span>
                      <span>·</span>
                      <span>Added recently</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/tools" 
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600"
              >
                View all tools
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Search</label>
              <form action="/tools" method="GET">
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    placeholder="Find tools..."
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Trending Mini */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Trending</h3>
                <Link href="/trending" className="text-xs text-slate-500 hover:text-orange-600">View all →</Link>
              </div>
              
              <div className="space-y-3">
                {trendingTools.slice(0, 5).map((tool, index) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <span className="w-5 text-center text-sm font-bold text-slate-400">{index + 1}</span>
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

            {/* Featured Mini */}
            {featuredTools.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-slate-900">Editor&apos;s Pick</h3>
                </div>
                
                <div className="space-y-3">
                  {featuredTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-600">
                        {tool.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-slate-900 group-hover:text-orange-600 truncate">
                          {tool.name}
                        </div>
                        <div className="text-xs text-slate-500">{tool.tagline}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-xs text-slate-500">Tools</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{categories.length}</div>
                  <div className="text-xs text-slate-500">Categories</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Tooli - Find the Perfect AI Tool for Your Workflow",
  description: "Discover 500+ AI tools with reviews, pricing, and trending scores. Find free AI tools, compare features, and find the perfect tool for your needs.",
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
  let featuredTools: any[] = [];
  let trendingTools: any[] = [];
  let categories: any[] = [];
  
  try {
    [featuredTools, trendingTools, categories] = await Promise.all([
      getFeaturedTools(),
      getTrendingTools(),
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
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Find the perfect tool<br />
            <span className="text-orange-600">for any task</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            500+ curated AI tools. No fluff, no paid placements — just honest info to help you decide.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools"
              className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Browse all tools
            </Link>
            <Link
              href="/trending"
              className="px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:border-slate-400 transition-colors"
            >
              See trending
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section - Podium Style */}
      <{featuredTools.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Editor&apos;s Pick
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Featured This Week</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* 2nd */}
              {featuredTools[1] && (
                <Link
                  href={`/tools/${featuredTools[1].slug}`}
                  className="group block bg-gradient-to-b from-slate-50 to-white rounded-t-xl border border-slate-200 
                             hover:border-slate-300 transition-all"
                >
                  <div className="text-center pt-6 pb-4">
                    <div className="text-3xl font-bold text-slate-400 mb-3">2</div>
                    <div className="w-14 h-14 mx-auto rounded-xl bg-slate-200 flex items-center justify-center 
                                    text-2xl font-bold text-slate-600 mb-3"
                    >
                      {featuredTools[1].name[0]}
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 truncate px-4">
                      {featuredTools[1].name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{featuredTools[1].category.name}</p>
                  </div>
                  <div className="h-2 bg-slate-300 rounded-b-xl"></div>
                </Link>
              )}

              {/* 1st */}
              {featuredTools[0] && (
                <Link
                  href={`/tools/${featuredTools[0].slug}`}
                  className="group block bg-gradient-to-b from-amber-50 to-white rounded-t-xl border-2 border-amber-200 
                             hover:border-amber-300 transition-all shadow-lg shadow-amber-100"
                >
                  <div className="text-center pt-8 pb-6">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 
                                    text-white text-sm font-bold rounded-full mb-3"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Top Pick
                    </div>
                    <div className="w-20 h-20 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 
                                    flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg"
                    >
                      {featuredTools[0].name[0]}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 truncate px-4">
                      {featuredTools[0].name}
                    </h3>
                    <p className="text-slate-600 mt-1">{featuredTools[0].tagline}</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                      {pricingLabels[featuredTools[0].pricingTier]}
                    </div>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-b-xl"></div>
                </Link>
              )}

              {/* 3rd */}
              {featuredTools[2] && (
                <Link
                  href={`/tools/${featuredTools[2].slug}`}
                  className="group block bg-gradient-to-b from-orange-50 to-white rounded-t-xl border border-orange-200 
                             hover:border-orange-300 transition-all"
                >
                  <div className="text-center pt-6 pb-4">
                    <div className="text-3xl font-bold text-orange-400 mb-3">3</div>
                    <div className="w-14 h-14 mx-auto rounded-xl bg-orange-200 flex items-center justify-center 
                                    text-2xl font-bold text-orange-700 mb-3"
                    >
                      {featuredTools[2].name[0]}
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 truncate px-4">
                      {featuredTools[2].name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{featuredTools[2].category.name}</p>
                  </div>
                  <div className="h-2 bg-orange-300 rounded-b-xl"></div>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Browse by Category</h2>
            <p className="text-slate-600">Find tools for your specific needs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 
                           hover:border-orange-300 hover:shadow-md transition-all"
              >
                <span className="text-2xl">{category.icon || "📁"}</span>
                <span className="font-medium text-slate-700 group-hover:text-orange-600">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-orange-600 font-medium hover:underline"
            >
              View all categories
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Preview */}
      <{trendingTools.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Trending Now</h2>
                <p className="text-slate-600">What the community is talking about</p>
              </div>
              <Link
                href="/trending"
                className="text-orange-600 font-medium hover:underline"
              >
                View full rankings →
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {trendingTools.slice(0, 5).map((tool, index) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <div className="w-8 text-center">
                    <span className="text-lg font-bold text-slate-400 group-hover:text-orange-500">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600"
                  >
                    {tool.name[0]}
                  </div>
                  
                  <div className="flex-1 min-w-0"
                  >
                    <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 truncate"
                    >
                      {tool.name}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{tool.tagline}</p>
                  </div>
                  
                  <div className="hidden sm:block text-sm text-slate-400"
                  >
                    {tool.category.name}
                  </div>
                  
                  <span className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have a tool to share?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Get in front of thousands of people actively looking for AI tools like yours.
          </p>
          <Link
            href="/submit"
            className="inline-flex px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Submit your tool
          </Link>
        </div>
      </section>
    </>
  );
}

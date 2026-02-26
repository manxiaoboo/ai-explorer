import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trending - Tooli",
  description: "The hottest AI tools right now. Ranked by real activity across GitHub, Product Hunt, and community engagement.",
  alternates: {
    canonical: "/trending",
  },
};

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
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span>/</span>
            <span className="text-slate-900">Trending</span>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Trending
              </h1>
              <p className="text-slate-600">
                The hottest tools right now. Updated daily.
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Ranked by activity</div>
              <div className="text-xs text-slate-400">GitHub · Product Hunt · Community</div>
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
                  className="group block bg-gradient-to-b from-slate-100 to-white rounded-t-xl border border-slate-200 
                             hover:border-slate-300 transition-all duration-300"
                >
                  <div className="text-center pt-6 pb-4">
                    <div className="text-4xl font-bold text-slate-400 mb-2">2</div>
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 
                                    flex items-center justify-center text-2xl font-bold text-slate-600 mb-3"
                    >
                      {top3[1].name[0]}
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 truncate px-4">
                      {top3[1].name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{pricingLabels[top3[1].pricingTier]}</p>
                  </div>                  
                  <div className="h-2 bg-slate-300 rounded-b-xl"></div>
                </Link>
              </div>
            )}
            
            {/* 1st Place */}
            {top3[0] && (
              <div className="order-1 md:order-2">
                <Link 
                  href={`/tools/${top3[0].slug}`}
                  className="group block bg-gradient-to-b from-amber-50 to-white rounded-t-xl border-2 border-amber-200 
                             hover:border-amber-300 transition-all duration-300 shadow-lg shadow-amber-100"
                >
                  <div className="text-center pt-8 pb-6">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 
                                    text-white text-xs font-bold rounded-full mb-3"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      #1
                    </div>
                    
                    <div className="w-20 h-20 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 
                                    flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg"
                    >
                      {top3[0].name[0]}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 truncate px-4">
                      {top3[0].name}
                    </h3>                    
                    <p className="text-sm text-slate-600 mt-1">{top3[0].category.name}</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                      {pricingLabels[top3[0].pricingTier]}
                    </div>
                  </div>
                  
                  <div className="h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-b-xl"></div>
                </Link>
              </div>
            )}
            
            {/* 3rd Place */}
            {top3[2] && (
              <div className="order-3">
                <Link 
                  href={`/tools/${top3[2].slug}`}
                  className="group block bg-gradient-to-b from-orange-50 to-white rounded-t-xl border border-orange-200 
                             hover:border-orange-300 transition-all duration-300"
                >
                  <div className="text-center pt-6 pb-4">
                    <div className="text-4xl font-bold text-orange-400 mb-2">3</div>
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-orange-200 to-orange-300 
                                    flex items-center justify-center text-2xl font-bold text-orange-700 mb-3"
                    >
                      {top3[2].name[0]}
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 truncate px-4">
                      {top3[2].name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{pricingLabels[top3[2].pricingTier]}</p>
                  </div>
                  
                  <div className="h-2 bg-orange-300 rounded-b-xl"></div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the list */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-12">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Rankings</span>
            <span className="text-sm text-slate-500">{rest.length} more tools</span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {rest.map((tool, index) => {
              const rank = index + 4;
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    <span className="text-lg font-bold text-slate-400 group-hover:text-slate-600">
                      {rank}
                    </span>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 
                                  flex items-center justify-center text-lg font-bold text-slate-600"
                  >
                    {tool.name[0]}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 truncate"
                      >
                        {tool.name}
                      </h3>
                      
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
                      >
                        {pricingLabels[tool.pricingTier]}
                      </span>
                    </div>                    
                    <p className="text-sm text-slate-500 truncate">
                      {tool.tagline}
                    </p>
                  </div>
                  
                  {/* Category */}
                  <div className="hidden sm:block text-sm text-slate-400">
                    {tool.category.name}
                  </div>
                  
                  {/* Arrow */}
                  <div className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                  >
                    →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Ranking Methodology */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-semibold text-slate-900">How rankings work</h3>
          </div>
          
          <p className="text-sm text-slate-600 mb-4">
            Our trending score combines multiple signals to surface the most relevant AI tools:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">GitHub Stars</div>
                <div className="text-xs text-slate-500">Open source popularity and community adoption</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">Product Hunt</div>
                <div className="text-xs text-slate-500">Community votes and launch buzz</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">Growth Rate</div>
                <div className="text-xs text-slate-500">Recent momentum and rising interest</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">Quality Signals</div>
                <div className="text-xs text-slate-500">Documentation, homepage, and maturity</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">User Engagement</div>
                <div className="text-xs text-slate-500">Clicks, saves, and community interest</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">Freshness</div>
                <div className="text-xs text-slate-500">New and recently updated tools</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Rankings are updated regularly to reflect the latest activity across all platforms. 
              No single metric dominates — we balance popularity, quality, and momentum.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

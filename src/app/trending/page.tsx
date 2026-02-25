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
            
            <div className="text-right text-sm text-slate-500">
              <div>Ranked by activity</div>
              <div>GitHub · Product Hunt · Community</div>
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
      </div>
    </>
  );
}

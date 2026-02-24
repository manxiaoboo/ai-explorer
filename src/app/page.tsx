import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PricingFilter } from "@/components/PricingFilter";
import { HeroSection } from "@/components/HeroSection";
import { TrendingTools } from "@/components/TrendingTools";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "AI Tools Hub - Discover the Best AI Tools for 2025",
  description: "Browse 500+ AI tools with pricing, reviews, and trending scores. Find free AI tools, compare features, and discover the best AI software for your needs.",
  alternates: {
    canonical: "/",
  },
};

async function getFeaturedTools() {
  return prisma.tool.findMany({
    where: { isFeatured: true, isActive: true },
    orderBy: { trendingScore: "desc" },
    take: 6,
    include: { category: true },
  });
}

async function getTrendingTools() {
  return prisma.tool.findMany({
    where: { isActive: true },
    orderBy: { trendingScore: "desc" },
    take: 10,
    include: { category: true },
  });
}

async function getCategories() {
  return prisma.category.findMany({});
}

async function getFreeTools() {
  return prisma.tool.findMany({
    where: { 
      isActive: true, 
      OR: [
        { pricingTier: "FREE" },
        { pricingTier: "FREEMIUM" },
        { hasFreeTier: true }
      ]
    },
    orderBy: { trendingScore: "desc" },
    take: 8,
    include: { category: true },
  });
}

export default async function HomePage() {
  const [featuredTools, trendingTools, categories, freeTools] = await Promise.all([
    getFeaturedTools(),
    getTrendingTools(),
    getCategories(),
    getFreeTools(),
  ]);

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Tools Hub",
    url: "https://aitools.example.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://aitools.example.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI Tools Hub",
    url: "https://aitools.example.com",
    logo: "https://aitools.example.com/logo.png",
  };

  return (
    <>
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={organizationStructuredData} />
      
      <HeroSection />

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              <CategoryFilter categories={categories} />
              <PricingFilter />
            </div>
          </aside>

          <main className="flex-1">
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Featured AI Tools</h2>
                <Link 
                  href="/tools" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🔥 Trending Now</h2>
                <Link 
                  href="/trending" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  See All Trending →
                </Link>
              </div>
              <TrendingTools tools={trendingTools} />
            </section>

            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🆓 Popular Free AI Tools</h2>
                <Link 
                  href="/free-ai-tools" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Browse All Free →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {freeTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} compact />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </section>
    </>
  );
}

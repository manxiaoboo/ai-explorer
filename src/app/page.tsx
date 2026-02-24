import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { HeroSection } from "@/components/HeroSection";
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
    take: 8,
    include: { category: true },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export default async function HomePage() {
  const [featuredTools, trendingTools, categories] = await Promise.all([
    getFeaturedTools(),
    getTrendingTools(),
    getCategories(),
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

  return (
    <>
      <StructuredData data={websiteStructuredData} />
      
      <HeroSection categories={categories} />

      {/* Featured Tools Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured AI Tools</h2>
          <Link 
            href="/tools" 
            className="text-lime-600 hover:text-lime-700 font-medium"
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

      {/* Trending Tools Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">🔥 Trending Now</h2>
          <Link 
            href="/trending" 
            className="text-lime-600 hover:text-lime-700 font-medium"
          >
            See All Trending →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} compact />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-lime-400 transition-all text-center"
            >
              <div className="text-3xl mb-3">{category.icon || "📁"}</div>
              <div className="font-semibold text-gray-900 group-hover:text-lime-600 transition-colors">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="bg-lime-400 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-gray-700 mb-8 max-w-xl mx-auto">
            Browse our complete directory of AI tools and find the perfect solution for your needs.
          </p>
          <Link
            href="/tools"
            className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            Browse All Tools
          </Link>
        </div>
      </section>
    </>
  );
}

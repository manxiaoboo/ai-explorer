import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { HeroSection } from "@/components/HeroSection";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Tooli - Find the Perfect AI Tool for Your Workflow",
  description: "Discover 500+ AI tools with reviews, pricing, and trending scores. Find free AI tools, compare features, and find the perfect tool for your needs.",
  alternates: {
    canonical: "/",
  },
};

// Helper function with retry logic
async function queryWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Database query attempt ${i + 1} failed, retrying...`);
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
      take: 6,
      include: { category: true },
    })
  );
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

async function getCategories() {
  return queryWithRetry(() =>
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    })
  );
}

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
      
      <HeroSection categories={categories} />

      {/* Featured Tools Section */}
      {featuredTools.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[2px] bg-[var(--accent)]"></span>
              <h2 className="text-xl font-medium text-[var(--foreground)]">Featured</h2>
            </div>
            <Link 
              href="/tools" 
              className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Tools Section */}
      {trendingTools.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto bg-[var(--surface)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[2px] bg-[var(--accent)]"></span>
              <h2 className="text-xl font-medium text-[var(--foreground)]">Trending</h2>
            </div>
            <Link 
              href="/trending" 
              className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              See more →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} compact />
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-6 h-[2px] bg-[var(--accent)]"></span>
            <h2 className="text-xl font-medium text-[var(--foreground)]">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group p-5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg 
                           hover:border-[var(--border-strong)] card-hover"
              >
                <div className="text-2xl mb-3">{category.icon || "📁"}</div>
                <div className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="bg-[var(--foreground)] rounded-lg p-8 md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-medium text-[var(--background)] mb-4">
              Can&apos;t find what you need?
            </h2>
            <p className="text-[var(--background)]/70 mb-8">
              Browse the full collection. We&apos;re adding new tools every week.
            </p>
            <Link
              href="/tools"
              className="inline-flex px-6 py-3 bg-[var(--background)] text-[var(--foreground)] font-medium rounded-md hover:bg-[var(--surface)] transition-colors"
            >
              See all tools
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

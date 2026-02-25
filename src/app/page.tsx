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
      take: 6,
      include: { category: true },
    })
  );
}

async function getNewTools() {
  return queryWithRetry(() =>
    prisma.tool.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
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
  let newTools: any[] = [];
  let categories: any[] = [];
  
  try {
    [featuredTools, trendingTools, newTools, categories] = await Promise.all([
      getFeaturedTools(),
      getTrendingTools(),
      getNewTools(),
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

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Navigation */}
          <aside className="lg:col-span-2 space-y-8">
            <nav>
              <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
                Browse
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/tools" className="block py-2 text-sm text-[var(--foreground)] hover:text-[var(--accent)]">
                    All Tools
                  </Link>
                </li>
                <li>
                  <Link href="/trending" className="block py-2 text-sm text-[var(--foreground)] hover:text-[var(--accent)]">
                    Trending
                  </Link>
                </li>
                <li>
                  <Link href="/free-ai-tools" className="block py-2 text-sm text-[var(--foreground)] hover:text-[var(--accent)]">
                    Free Tools
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="block py-2 text-sm text-[var(--foreground)] hover:text-[var(--accent)]">
                    News
                  </Link>
                </li>
              </ul>
            </nav>

            <nav>
              <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
                Categories
              </h3>
              <ul className="space-y-1">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/category/${category.slug}`}
                      className="block py-2 text-sm text-[var(--muted)] hover:text-[var(--accent)]"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-7 space-y-12">
            {/* Featured Section */}
            {featuredTools.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-[var(--foreground)]">Featured</h2>
                  <Link href="/tools" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {featuredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} featured />
                  ))}
                </div>
              </section>
            )}

            {/* Trending Section */}
            {trendingTools.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-[var(--foreground)]">Trending</h2>
                  <Link href="/trending" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
                    See more
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} compact />
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Right Sidebar - New & CTA */}
          <aside className="lg:col-span-3 space-y-8">
            {/* New Tools */}
            {newTools.length > 0 && (
              <div className="bg-[var(--surface)] rounded-lg p-5">
                <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
                  Recently Added
                </h3>
                <div className="space-y-4">
                  {newTools.map((tool) => (
                    <Link 
                      key={tool.id} 
                      href={`/tools/${tool.slug}`}
                      className="block group"
                    >
                      <div className="font-medium text-sm text-[var(--foreground)] group-hover:text-[var(--accent)]">
                        {tool.name}
                      </div>
                      <div className="text-xs text-[var(--muted)] line-clamp-1">
                        {tool.tagline}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Submit CTA */}
            <div className="bg-[var(--foreground)] rounded-lg p-5">
              <h3 className="text-sm font-medium text-[var(--background)] mb-2">
                Have a tool?
              </h3>
              <p className="text-xs text-[var(--background)]/70 mb-4">
                Get in front of people actively looking for solutions.
              </p>
              <Link
                href="/submit"
                className="inline-flex px-4 py-2 bg-[var(--background)] text-[var(--foreground)] text-sm font-medium rounded hover:bg-[var(--surface)] transition-colors"
              >
                Submit
              </Link>
            </div>

            {/* Stats */}
            <div className="border border-[var(--border)] rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-medium text-[var(--foreground)]">500+</div>
                  <div className="text-xs text-[var(--muted)]">Tools</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-[var(--foreground)]">50+</div>
                  <div className="text-xs text-[var(--muted)]">Categories</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Browse All Tools - Tooli",
  description: "Explore 500+ AI tools curated by Tooli. Filter by category, pricing, and features to find exactly what you need.",
  alternates: {
    canonical: "/tools",
  },
};

async function getAllTools() {
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tools = await prisma.tool.findMany({
        where: { isActive: true },
        orderBy: { trendingScore: "desc" },
        include: { category: true },
      });
      return tools;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  console.error('All database query attempts failed:', lastError);
  return [];
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export default async function ToolsPage() {
  const [tools, categories] = await Promise.all([
    getAllTools(),
    getCategories(),
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Browse All Tools",
    description: "Complete collection of AI tools curated by Tooli",
    url: "https://tooli.ai/tools",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://tooli.ai/tools/${tool.slug}`,
        name: tool.name,
      })),
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-4">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            <span>/</span>
            <span>Tools</span>
          </div>
          
          <h1 className="text-3xl font-medium text-[var(--foreground)] mb-2">
            All Tools
          </h1>
          <p className="text-[var(--muted)]">
            {tools.length} tools, organized and ready to explore.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Search */}
            <div className="bg-[var(--surface)] rounded-lg p-4">
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Filter by name..."
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Categories */}
            <div className="bg-[var(--surface)] rounded-lg p-4">
              <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
                Categories
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/tools"
                    className="block py-1.5 text-sm text-[var(--accent)]"
                  >
                    All Categories
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/category/${category.slug}`}
                      className="block py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing Filter */}
            <div className="bg-[var(--surface)] rounded-lg p-4">
              <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
                Pricing
              </h3>
              <ul className="space-y-2">
                {['Free', 'Freemium', 'Paid'].map((price) => (
                  <li key={price}>
                    <label className="flex items-center gap-2 text-sm text-[var(--muted)] cursor-pointer">
                      <input type="checkbox" className="rounded border-[var(--border)]" />
                      {price}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Tools Grid */}
          <main className="lg:col-span-9">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--muted)]">
                Showing {tools.length} tools
              </span>
              
              <select className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-sm">
                <option>Trending</option>
                <option>Newest</option>
                <option>Name A-Z</option>
              </select>
            </div>

            {tools.length === 0 ? (
              <div className="text-center py-16 bg-[var(--surface)] rounded-lg">
                <p className="text-[var(--muted)]">No tools found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

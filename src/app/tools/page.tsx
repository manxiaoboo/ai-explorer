import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";
import Link from "next/link";
import { redirect } from "next/navigation";

interface ToolsPageProps {
  searchParams: Promise<{
    category?: string;
    pricing?: string;
    sort?: string;
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ToolsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters: string[] = [];
  
  if (params.category) filters.push(params.category);
  if (params.pricing) filters.push(params.pricing);
  if (params.q) filters.push(`"${params.q}"`);
  
  const title = filters.length > 0 
    ? `${filters.join(', ')} - Tooli`
    : 'Browse All Tools - Tooli';
    
  const description = filters.length > 0
    ? `Discover ${filters.join(', ')} AI tools curated by Tooli. Compare features, pricing, and find the right tool for your needs.`
    : 'Explore 500+ AI tools curated by Tooli. Filter by category, pricing, and features to find exactly what you need.';

  return {
    title,
    description,
    alternates: {
      canonical: '/tools',
    },
  };
}

async function getTools(filters: {
  category?: string;
  pricing?: string;
  sort?: string;
  q?: string;
}) {
  const where: any = { isActive: true };
  
  // Category filter
  if (filters.category) {
    const category = await prisma.category.findUnique({
      where: { slug: filters.category },
    });
    if (category) {
      where.categoryId = category.id;
    }
  }
  
  // Pricing filter
  if (filters.pricing) {
    const pricingTiers = filters.pricing.split(',').filter(Boolean);
    if (pricingTiers.length > 0) {
      where.pricingTier = { in: pricingTiers };
    }
  }
  
  // Search filter
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: 'insensitive' } },
      { tagline: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  
  // Sort order
  let orderBy: any = { trendingScore: 'desc' };
  switch (filters.sort) {
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'name':
      orderBy = { name: 'asc' };
      break;
    case 'trending':
    default:
      orderBy = { trendingScore: 'desc' };
  }
  
  return prisma.tool.findMany({
    where,
    orderBy,
    include: { category: true },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams;
  
  const [tools, categories] = await Promise.all([
    getTools(params),
    getCategories(),
  ]);
  
  // Current filter state
  const currentCategory = params.category;
  const currentPricing = params.pricing?.split(',').filter(Boolean) || [];
  const currentSort = params.sort || 'trending';
  const currentQuery = params.q || '';
  
  // Helper to build filter URLs
  const getCategoryUrl = (slug: string | null) => {
    if (slug === null) {
      return buildUrl('/tools', {
        pricing: params.pricing,
        sort: params.sort,
        q: params.q,
      });
    }
    return buildUrl('/tools', {
      category: slug,
      pricing: params.pricing,
      sort: params.sort,
      q: params.q,
    });
  };
  
  const getPricingUrl = (tier: string) => {
    const newPricing = currentPricing.includes(tier)
      ? currentPricing.filter(p => p !== tier).join(',')
      : [...currentPricing, tier].join(',');
    return buildUrl('/tools', {
      category: params.category,
      pricing: newPricing || undefined,
      sort: params.sort,
      q: params.q,
    });
  };
  
  const getSortUrl = (sort: string) => buildUrl('/tools', {
    category: params.category,
    pricing: params.pricing,
    sort,
    q: params.q,
  });
  
  const getSearchUrl = (q: string) => buildUrl('/tools', {
    category: params.category,
    pricing: params.pricing,
    sort: params.sort,
    q: q || undefined,
  });
  
  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: currentCategory 
      ? `${categories.find(c => c.slug === currentCategory)?.name || currentCategory} Tools`
      : "Browse All Tools",
    description: `Complete collection of AI tools${currentCategory ? ' in ' + currentCategory : ''} curated by Tooli`,
    url: buildUrl('https://tooli.ai/tools', params),
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
  
  // Active filters count
  const activeFiltersCount = (currentCategory ? 1 : 0) + currentPricing.length + (currentQuery ? 1 : 0);

  return (
    <>
      <StructuredData data={structuredData} />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--muted)] mb-4">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          <span>/</span>
          {currentCategory ? (
            <>
              <Link href="/tools" className="hover:text-[var(--accent)]">Tools</Link>
              <span>/</span>
              <span className="text-[var(--foreground)]">{categories.find(c => c.slug === currentCategory)?.name || currentCategory}</span>
            </>
          ) : (
            <span className="text-[var(--foreground)]">All Tools</span>
          )}
        </nav>
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-medium text-[var(--foreground)] mb-2">
            {currentCategory 
              ? categories.find(c => c.slug === currentCategory)?.name || currentCategory
              : 'All Tools'}
          </h1>
          <p className="text-[var(--muted)]">
            {tools.length} tool{tools.length !== 1 ? 's' : ''}
            {currentQuery && ` matching "${currentQuery}"`}
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
              <form action="/tools" method="GET">
                <input type="hidden" name="category" value={params.category || ''} />
                <input type="hidden" name="pricing" value={params.pricing || ''} />
                <input type="hidden" name="sort" value={params.sort || ''} />
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    defaultValue={currentQuery}
                    placeholder="Search tools..."
                    className="w-full px-3 py-2 pr-10 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Categories */}
            <div className="bg-[var(--surface)] rounded-lg p-4">
              <h3 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-3">
                Categories
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    href={getCategoryUrl(null)}
                    className={`block py-1.5 text-sm ${
                      !currentCategory 
                        ? 'text-[var(--accent)] font-medium' 
                        : 'text-[var(--foreground)] hover:text-[var(--accent)]'
                    }`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={getCategoryUrl(category.slug)}
                      className={`block py-1.5 text-sm ${
                        currentCategory === category.slug
                          ? 'text-[var(--accent)] font-medium'
                          : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
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
                {[
                  { value: 'FREE', label: 'Free' },
                  { value: 'FREEMIUM', label: 'Freemium' },
                  { value: 'PAID', label: 'Paid' },
                  { value: 'OPEN_SOURCE', label: 'Open Source' },
                ].map((option) => {
                  const isActive = currentPricing.includes(option.value);
                  return (
                    <li key={option.value}>
                      <Link
                        href={getPricingUrl(option.value)}
                        className={`flex items-center gap-2 text-sm ${
                          isActive 
                            ? 'text-[var(--accent)]' 
                            : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isActive 
                            ? 'bg-[var(--accent)] border-[var(--accent)]' 
                            : 'border-[var(--border)]'
                        }`}>
                          {isActive && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        {option.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Link
                href="/tools"
                className="block w-full py-2 text-center text-sm text-[var(--muted)] hover:text-[var(--accent)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors"
              >
                Clear all filters ({activeFiltersCount})
              </Link>
            )}
          </aside>

          {/* Tools Grid */}
          <main className="lg:col-span-9">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--muted)]">
                Showing {tools.length} result{tools.length !== 1 ? 's' : ''}
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted)]">Sort by:</span>
                <div className="flex items-center border border-[var(--border)] rounded overflow-hidden">
                  {[
                    { value: 'trending', label: 'Trending' },
                    { value: 'newest', label: 'Newest' },
                    { value: 'name', label: 'Name' },
                  ].map((option) => (
                    <Link
                      key={option.value}
                      href={getSortUrl(option.value)}
                      className={`px-3 py-1.5 text-sm ${
                        currentSort === option.value
                          ? 'bg-[var(--foreground)] text-[var(--background)]'
                          : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {tools.length === 0 ? (
              <div className="text-center py-16 bg-[var(--surface)] rounded-lg">
                <p className="text-[var(--muted)] mb-2">No tools found.</p>
                <p className="text-sm text-[var(--muted-foreground)]">Try adjusting your filters.</p>
                <Link
                  href="/tools"
                  className="inline-block mt-4 px-4 py-2 text-sm text-[var(--accent)] hover:underline"
                >
                  Clear all filters
                </Link>
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

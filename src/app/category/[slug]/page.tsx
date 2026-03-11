import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ToolListItem } from "@/components/ToolListItem";
import { StructuredData } from "@/components/StructuredData";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

async function getToolsByCategory(categoryId: string) {
  return prisma.tool.findMany({
    where: { 
      isActive: true,
      categoryId,
    },
    orderBy: { trendingScore: "desc" },
    include: { category: true },
  });
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  
  if (!category) {
    return { title: "Category Not Found" };
  }
  
  return {
    title: `${category.name} AI Tools - Atooli`,
    description: `Discover the best ${category.name.toLowerCase()} AI tools. Compare features, pricing, and find the perfect ${category.name.toLowerCase()} solution for your needs.`,
    alternates: {
      canonical: `/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }

  const tools = await getToolsByCategory(category.id);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} AI Tools`,
    description: category.description,
    url: `https://tooli.ai/category/${slug}`,
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

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://tooli.ai" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://tooli.ai/tools" },
      { "@type": "ListItem", position: 3, name: category.name, item: `https://tooli.ai/category/${slug}` },
    ],
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData data={breadcrumbData} />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-[var(--accent)]">Tools</Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">{category.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-8 pb-6 border-b border-[var(--border-soft)]">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{category.name} AI Tools</h1>
          {category.description && (
            <p className="text-[var(--foreground-muted)] max-w-2xl">{category.description}</p>
          )}
          <p className="text-sm text-[var(--foreground-muted)] mt-4">{tools.length} tools in this category</p>
        </header>
        
        {/* Tools List */}
        {tools.length > 0 ? (
          <div className="divide-y divide-[var(--border-soft)]">
            {tools.map((tool) => (
              <ToolListItem key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[var(--foreground-muted)]">No tools found in this category yet.</p>
          </div>
        )}

        {/* Browse All CTA */}
        <div className="mt-12 pt-8 border-t border-[var(--border-soft)] text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline"
          >
            Browse all categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}

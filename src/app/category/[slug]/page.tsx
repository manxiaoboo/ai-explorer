import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";
import Link from "next/link";

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

  // CollectionPage structured data
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

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://tooli.ai",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://tooli.ai/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `https://tooli.ai/category/${slug}`,
      },
    ],
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData data={breadcrumbData} />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-[var(--accent)]">Tools</Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">{category.name}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">{category.name} AI Tools</h1>
          <p className="text-[var(--muted)] mt-2">{category.description}</p>
          <p className="text-sm text-[var(--muted)] mt-4">{tools.length} tools in this category</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </>
  );
}

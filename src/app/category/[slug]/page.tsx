import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";

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
    title: `${category.name} Tools - Atooli`,
    description: `The best ${category.name.toLowerCase()} tools we could find. Compared, reviewed, and ready to try.`,
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
    name: `${category.name} Tools`,
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

  return (
    <>
      <StructuredData data={structuredData} />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name} Tools</h1>
          <p className="text-gray-600 mt-2">{category.description}</p>
          <p className="text-sm text-gray-500 mt-4">{tools.length} tools in this category</p>
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

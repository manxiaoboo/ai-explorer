import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "All AI Tools - Complete Directory",
  description: "Browse our complete directory of AI tools. Filter by category, pricing, and features to find the perfect tool for your needs.",
  alternates: {
    canonical: "/tools",
  },
};

async function getAllTools() {
  return prisma.tool.findMany({
    where: { isActive: true },
    orderBy: { trendingScore: "desc" },
  });
}

export default async function ToolsPage() {
  const tools = await getAllTools();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All AI Tools",
    description: "Complete directory of AI tools",
    url: "https://aitools.example.com/tools",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://aitools.example.com/tools/${tool.slug}`,
        name: tool.name,
      })),
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-semibold text-[var(--foreground)] mb-4"
          >
            All AI Tools
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl"
          >
            Browse our complete directory of {tools.length} AI tools. 
            Filter by category, pricing, and features.
          </p>
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

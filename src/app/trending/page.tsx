import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Trending AI Tools - What's Hot Right Now",
  description: "Discover the fastest-growing AI tools. Updated daily based on GitHub stars, Product Hunt votes, and community buzz.",
  alternates: {
    canonical: "/trending",
  },
};

async function getTrendingTools() {
  return prisma.tool.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { trendingScore: "desc" },
    take: 50,
  });
}

export default async function TrendingPage() {
  const tools = await getTrendingTools();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trending AI Tools",
    description: "Discover the fastest-growing AI tools updated daily.",
    url: "https://aitools.example.com/trending",
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
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔥 Trending AI Tools</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the fastest-growing AI tools. Updated daily based on 
            GitHub stars, Product Hunt votes, and community buzz.
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

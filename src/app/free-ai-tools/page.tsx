import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Free AI Tools - Best Free AI Software",
  description: "Discover 120+ free AI tools. No credit card required. Find free alternatives to popular AI software for writing, images, coding, and more.",
  alternates: {
    canonical: "/free-ai-tools",
  },
};

async function getFreeTools() {
  return prisma.tool.findMany({
    where: { 
      isActive: true, 
      OR: [
        { pricingTier: "FREE" },
        { pricingTier: "FREEMIUM" },
        { hasFreeTier: true }
      ]
    },
    include: { category: true },
    orderBy: { trendingScore: "desc" },
  });
}

export default async function FreeToolsPage() {
  const tools = await getFreeTools();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free AI Tools",
    description: "Discover 120+ free AI tools with no credit card required.",
    url: "https://aitools.example.com/free-ai-tools",
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🆓 Free AI Tools</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover {tools.length}+ free AI tools. No credit card required. 
            Find free alternatives to popular AI software.
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

import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Free AI Tools - No Credit Card Required | atooli",
  description: "120+ genuinely free AI tools. No trials, no tricks. Find free alternatives for writing, images, coding, and more.",
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
    orderBy: { trendingScore: "desc" },
    include: { category: true },
  });
}

export default async function FreeToolsPage() {
  const tools = await getFreeTools();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free AI Tools",
    description: "Discover 120+ free AI tools with no credit card required.",
    url: "https://tooli.ai/free-ai-tools",
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
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🆓 Free Tools</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {tools.length}+ tools that won&apos;t ask for your credit card. 
            Free tiers, open source, and genuinely no-cost options.
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

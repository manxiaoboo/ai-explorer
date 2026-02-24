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
  // Retry logic for database connection issues
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
      console.log(`Database query attempt ${i + 1} failed, retrying...`);
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  // If all retries failed, return empty array instead of crashing
  console.error('All database query attempts failed:', lastError);
  return [];
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            All AI Tools
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Browse our complete directory of {tools.length} AI tools. 
            Filter by category, pricing, and features.
          </p>
        </header>

        {tools.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500">Unable to load tools. Please refresh the page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

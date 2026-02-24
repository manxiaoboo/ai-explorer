import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { StructuredData } from "@/components/StructuredData";

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getTool(slug: string) {
  return prisma.tool.findUnique({
    where: { slug },
    include: { category: true },
  });
}

async function getRelatedTools(categoryId: string, currentToolId: string) {
  return prisma.tool.findMany({
    where: { 
      isActive: true,
      categoryId,
    },
    orderBy: { trendingScore: "desc" },
    take: 4,
  });
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  if (!tool) {
    return { title: "Tool Not Found" };
  }
  
  return {
    title: `${tool.name} - ${tool.tagline}`,
    description: tool.description.slice(0, 160),
    alternates: {
      canonical: `/tools/${slug}`,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  if (!tool) {
    notFound();
  }

  const relatedTools = await getRelatedTools(tool.category.id, tool.id);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "AIApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: tool.priceStart || 0,
      priceCurrency: "USD",
    },
    description: tool.description,
    url: tool.website,
    category: tool.category.name,
    featureList: tool.features,
    ...(tool.githubStars && tool.githubStars > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Math.min(5, Math.max(1, tool.githubStars / 1000)),
        reviewCount: tool.githubStars,
      },
    }),
  };

  const pricingLabel = {
    FREE: "Free",
    FREEMIUM: "Freemium",
    PAID: "Paid",
    ENTERPRISE: "Enterprise",
    OPEN_SOURCE: "Open Source",
  }[tool.pricingTier];

  return (
    <>
      <StructuredData data={structuredData} />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2">
            <header className="mb-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                  {tool.name[0]}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
                  <p className="text-lg text-gray-600 mt-2">{tool.tagline}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {tool.category.name}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      {pricingLabel}
                    </span>
                    {tool.trendingScore > 50 && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        🔥 Trending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <section className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600">{tool.description}</p>
            </section>

            {tool.features.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Key Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tool.useCases.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Use Cases</h2>
                <ul className="space-y-2">
                  {tool.useCases.map((useCase) => (
                    <li key={useCase} className="text-gray-600">{useCase}</li>
                  ))}
                </ul>
              </section>
            )}

            {relatedTools.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Similar Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedTools.map((relatedTool) => (
                    <ToolCard key={relatedTool.id} tool={{...relatedTool, category: tool.category}} compact />
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Visit Website →
              </a>
            </div>

            <div className="border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Pricing</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{pricingLabel}</span>
                </div>
                {tool.priceStart && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Price</span>
                    <span className="font-medium">${tool.priceStart}/mo</span>
                  </div>
                )}
                {tool.hasFreeTier && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Free Tier</span>
                    <span className="text-green-600 font-medium">✓ Available</span>
                  </div>
                )}
                {tool.hasTrial && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Free Trial</span>
                    <span className="text-green-600 font-medium">✓ Available</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Metrics</h3>
              <div className="space-y-3">
                {tool.githubStars && tool.githubStars > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">GitHub Stars</span>
                    <span className="font-medium">⭐ {tool.githubStars.toLocaleString()}</span>
                  </div>
                )}
                {tool.productHuntVotes && tool.productHuntVotes > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Hunt</span>
                    <span className="font-medium">🚀 {tool.productHuntVotes}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Trending Score</span>
                  <span className="font-medium">{tool.trendingScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

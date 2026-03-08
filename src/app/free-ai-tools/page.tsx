import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";
import FreeToolsPageClient from "./FreeToolsPageClient";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Free AI Tools - No Credit Card Required",
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
        { pricingTier: "OPEN_SOURCE" },
        { hasFreeTier: true },
        { hasTrial: true }
      ]
    },
    orderBy: { trendingScore: "desc" },
    include: { category: true },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: {
      tools: {
        some: {
          isActive: true,
          OR: [
            { pricingTier: "FREE" },
            { pricingTier: "FREEMIUM" },
            { pricingTier: "OPEN_SOURCE" },
            { hasFreeTier: true },
            { hasTrial: true }
          ]
        }
      }
    },
    orderBy: { sortOrder: "asc" }
  });
}

export default async function FreeToolsPage() {
  const [tools, categories] = await Promise.all([
    getFreeTools(),
    getCategories()
  ]);

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
      <FreeToolsPageClient 
        tools={tools} 
        categories={categories} 
      />
    </>
  );
}

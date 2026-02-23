import { getServerSideSitemap } from "next-sitemap/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const baseUrl = "https://aitools.example.com";

  // Fetch all tools and categories
  const [tools, categories] = await Promise.all([
    prisma.tool.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  // Generate sitemap entries
  const toolEntries = tools.map((tool) => ({
    loc: `${baseUrl}/tools/${tool.slug}`,
    lastmod: tool.updatedAt.toISOString(),
    changefreq: "weekly" as const,
    priority: 0.8,
  }));

  const categoryEntries = categories.map((category) => ({
    loc: `${baseUrl}/category/${category.slug}`,
    lastmod: category.updatedAt.toISOString(),
    changefreq: "weekly" as const,
    priority: 0.6,
  }));

  const staticEntries = [
    { loc: baseUrl, changefreq: "daily" as const, priority: 1.0 },
    { loc: `${baseUrl}/tools`, changefreq: "daily" as const, priority: 0.9 },
    { loc: `${baseUrl}/free-ai-tools`, changefreq: "daily" as const, priority: 0.9 },
    { loc: `${baseUrl}/trending`, changefreq: "daily" as const, priority: 0.9 },
  ];

  return getServerSideSitemap([
    ...staticEntries,
    ...toolEntries,
    ...categoryEntries,
  ]);
}

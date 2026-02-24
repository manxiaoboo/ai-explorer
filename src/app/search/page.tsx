import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ToolCard } from "@/components/ToolCard";
import { SearchBox } from "@/components/SearchBox";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} | AI Tools Hub` : "Search AI Tools",
    description: "Search for AI tools by name, category, or use case.",
  };
}

async function searchTools(query: string) {
  if (!query || query.length < 2) {
    return [];
  }

  // Retry logic
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tools = await prisma.tool.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { tagline: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } },
            { features: { has: query } },
            { useCases: { has: query } },
          ],
        },
        include: {
          category: true,
        },
        orderBy: {
          trendingScore: "desc",
        },
      });
      return tools;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  console.error("Search failed:", lastError);
  return [];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";
  const tools = await searchTools(query);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
          Search AI Tools
        </h1>
        <div className="max-w-2xl">
          <SearchBox />
        </div>
      </header>

      {query && (
        <>
          <div className="mb-8">
            <p className="text-slate-600">
              {tools.length > 0 ? (
                <>
                  Found <span className="font-semibold text-slate-900">{tools.length}</span> result
                  {tools.length !== 1 && "s"} for "<span className="font-semibold text-slate-900">{query}</span>"
                </>
              ) : (
                <>
                  No results found for "<span className="font-semibold text-slate-900">{query}</span>"
                </>
              )}
            </p>
          </div>

          {tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No tools found</h2>
              <p className="text-slate-600 mb-6">Try searching with different keywords</p>
              <Link
                href="/tools"
                className="inline-block px-6 py-3 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-colors"
              >
                Browse All Tools
              </Link>
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="text-center py-16 bg-slate-50 rounded-2xl">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-600">Enter a search term to find AI tools</p>
        </div>
      )}
    </div>
  );
}

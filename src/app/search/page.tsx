"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ToolListItem } from "@/components/ToolListItem";
import { SearchBox } from "@/components/SearchBox";

interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: { name: string };
  pricingTier: 'FREE' | 'FREEMIUM' | 'PAID' | 'ENTERPRISE' | 'OPEN_SOURCE';
  trendingScore: number;
  logo: string | null;
  createdAt: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTools = async () => {
      if (!query || query.length < 2) {
        setTools([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setTools(data.tools || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, [query]);

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[var(--foreground-muted)]">Searching...</p>
      </div>
    );
  }

  return (
    <>
      {query && (
        <>
          <div className="mb-6 pb-4 border-b border-[var(--border-soft)]">
            <p className="text-[var(--foreground-muted)]">
              {tools.length > 0 ? (
                <>
                  Found <span className="font-semibold text-[var(--foreground)]">{tools.length}</span> result
                  {tools.length !== 1 && "s"} for "<span className="font-semibold text-[var(--foreground)]">{query}</span>"
                </>
              ) : (
                <>
                  No results found for "<span className="font-semibold text-[var(--foreground)]">{query}</span>"
                </>
              )}
            </p>
          </div>

          {tools.length > 0 ? (
            <div className="divide-y divide-[var(--border-soft)]">
              {tools.map((tool: Tool) => (
                <ToolListItem 
                  key={tool.id} 
                  tool={{
                    ...tool,
                    createdAt: new Date(tool.createdAt),
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">No tools found</h2>
              <p className="text-[var(--foreground-muted)] mb-6">Try searching with different keywords</p>
              <Link
                href="/tools"
                className="inline-block px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-full hover:opacity-90 transition-colors"
              >
                Browse All Tools
              </Link>
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-[var(--foreground-muted)]">Enter a search term to find AI tools</p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-6">
          Search AI Tools
        </h1>
        <div className="max-w-2xl">
          <SearchBox />
        </div>
      </header>

      <Suspense fallback={
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}

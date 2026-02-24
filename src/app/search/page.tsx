"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ToolCard } from "@/components/ToolCard";
import { SearchBox } from "@/components/SearchBox";

interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: { name: string };
  pricingTier: string;
  trendingScore: number;
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
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Searching...</p>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}

export default function SearchPage() {
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

      <Suspense fallback={
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ToolLogo } from "./ToolLogo";

interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo: string | null;
  category: { name: string };
  pricingTier: string;
}

function HeroSearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Tool[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize query from URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSuggestions(data.tools || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/tools/${slug}`);
    setShowSuggestions(false);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search AI tools..."
          className="w-full px-5 py-3.5 pr-12 text-slate-900 bg-white 
                     border border-slate-300 rounded-xl
                     focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100
                     transition-all duration-200 shadow-sm"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 
                     bg-slate-900 hover:bg-orange-600 
                     rounded-lg flex items-center justify-center 
                     transition-colors duration-200"
        >
          {isLoading ? (
            <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          {suggestions.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleSuggestionClick(tool.slug)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <ToolLogo name={tool.name} logo={tool.logo} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900">{tool.name}</div>
                  <div className="text-xs text-slate-500 truncate">{tool.tagline}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  {tool.category.name}
                </span>
              </div>
            </button>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="block w-full px-4 py-2.5 text-center text-sm text-orange-600 font-medium hover:bg-slate-50 transition-colors"
          >
            View all results →
          </Link>
        </div>
      )}
    </div>
  );
}

export function HeroSearch() {
  return (
    <Suspense fallback={
      <div className="relative w-full max-w-xl">
        <div className="w-full px-5 py-3.5 text-slate-400 bg-white border border-slate-300 rounded-xl shadow-sm">
          Search AI tools...
        </div>
      </div>
    }>
      <HeroSearchInner />
    </Suspense>
  );
}

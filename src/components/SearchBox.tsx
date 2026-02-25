"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: { name: string };
  pricingTier: string;
}

function SearchBoxInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Tool[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize query from URL on client side
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
    <div className="relative max-w-xl mx-auto">
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
          placeholder="Search tools..."
          className="w-full px-5 py-4 pr-14 text-[var(--foreground)] bg-[var(--surface-elevated)] 
                     border border-[var(--border)] rounded-lg
                     focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
                     transition-all duration-200 shadow-sm"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 
                     bg-[var(--foreground)] hover:bg-[var(--secondary)] 
                     rounded-md flex items-center justify-center 
                     transition-colors duration-200"
        >
          {isLoading ? (
            <svg className="w-5 h-5 text-[var(--background)] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[var(--background)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface-elevated)] rounded-lg shadow-lg border border-[var(--border)] overflow-hidden z-50">
          {suggestions.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleSuggestionClick(tool.slug)}
              className="w-full px-5 py-4 text-left hover:bg-[var(--surface)] transition-colors border-b border-[var(--border)] last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--surface-subtle)] rounded-lg flex items-center justify-center text-[var(--foreground)] font-semibold"
                >
                  {tool.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--foreground)]">{tool.name}</div>
                  <div className="text-sm text-[var(--muted)] truncate">{tool.tagline}</div>
                </div>
                <span className="text-xs px-2 py-1 bg-[var(--surface)] text-[var(--muted)] rounded-full border border-[var(--border)]">
                  {tool.category.name}
                </span>
              </div>
            </button>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="block w-full px-5 py-3 text-center text-[var(--accent)] font-medium hover:bg-[var(--surface)] transition-colors"
          >
            View all results →
          </Link>
        </div>
      )}
    </div>
  );
}

export function SearchBox() {
  return (
    <Suspense fallback={
      <div className="relative max-w-xl mx-auto">
        <div className="w-full px-5 py-4 pr-14 text-[var(--foreground)] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg shadow-sm">
          Search tools...
        </div>
      </div>
    }>
      <SearchBoxInner />
    </Suspense>
  );
}

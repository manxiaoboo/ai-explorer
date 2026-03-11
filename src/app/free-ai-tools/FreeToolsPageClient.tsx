"use client";

import { useState, useMemo } from "react";
import { ToolListItem } from "@/components/ToolListItem";

interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo: string | null;
  pricingTier: 'FREE' | 'FREEMIUM' | 'PAID' | 'ENTERPRISE' | 'OPEN_SOURCE';
  hasFreeTier: boolean;
  hasTrial: boolean;
  trendingScore: number;
  githubStars: number | null;
  features: string[];
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface FreeToolsPageProps {
  tools: Tool[];
  categories: { id: string; name: string; slug: string }[];
}

export default function FreeToolsPageClient({ tools, categories }: FreeToolsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPricing, setSelectedPricing] = useState<string>("all");

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        searchQuery === "" ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || tool.category.id === selectedCategory;

      const matchesPricing =
        selectedPricing === "all" ||
        (selectedPricing === "free" && tool.pricingTier === "FREE") ||
        (selectedPricing === "freemium" && tool.pricingTier === "FREEMIUM") ||
        (selectedPricing === "open-source" && tool.pricingTier === "OPEN_SOURCE") ||
        (selectedPricing === "has-trial" && tool.hasTrial);

      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [tools, searchQuery, selectedCategory, selectedPricing]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPricing("all");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    selectedPricing !== "all";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
          Free AI Tools
        </h1>
        <p className="text-xl text-[var(--foreground-muted)] max-w-2xl">
          {tools.length}+ tools that won&apos;t ask for your credit card. Free
          tiers, open source, and genuinely no-cost options.
        </p>
      </header>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search free tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-11 bg-[var(--background)] border border-[var(--border)] rounded-xl
                     text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]
                     focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg
                     text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Pricing Filter */}
          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg
                     text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="all">All Types</option>
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="open-source">Open Source</option>
            <option value="has-trial">Free Trial</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-[var(--foreground-muted)] text-sm">
          Showing {filteredTools.length} of {tools.length} tools
          {hasActiveFilters && " (filtered)"}
        </div>
      </div>

      {/* Tools List */}
      {filteredTools.length > 0 ? (
        <div className="divide-y divide-[var(--border-soft)]">
          {filteredTools.map((tool) => (
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
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            No tools found
          </h3>
          <p className="text-[var(--foreground-muted)] mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

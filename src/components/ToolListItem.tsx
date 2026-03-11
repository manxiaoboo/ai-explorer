"use client";

import Link from "next/link";
import { ToolLogo } from "./ToolLogo";

interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description?: string;
  category: { name: string };
  pricingTier: 'FREE' | 'FREEMIUM' | 'PAID' | 'ENTERPRISE' | 'OPEN_SOURCE';
  trendingScore: number;
  logo?: string | null;
  createdAt?: Date;
}

interface ToolListItemProps {
  tool: Tool;
  index?: number;
  showDescription?: boolean;
}

const pricingLabels: Record<string, string> = {
  FREE: "Free",
  FREEMIUM: "Freemium",
  PAID: "Paid",
  ENTERPRISE: "Enterprise",
  OPEN_SOURCE: "Open Source",
};

const pricingColors: Record<string, string> = {
  FREE: "text-[var(--accent-2)]",
  FREEMIUM: "text-[#b8860b]",
  PAID: "text-[var(--foreground-muted)]",
  ENTERPRISE: "text-[var(--foreground-muted)]",
  OPEN_SOURCE: "text-blue-600",
};

function isNewTool(createdAt?: Date): boolean {
  if (!createdAt) return false;
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return new Date(createdAt) > threeDaysAgo;
}

export function ToolListItem({ tool, index, showDescription = false }: ToolListItemProps) {
  const isTrending = tool.trendingScore > 80;
  
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-center gap-4 py-4 px-4 -mx-4 rounded-xl
                 hover:bg-[var(--surface-warm)] transition-all duration-200"
    >
      {/* Optional Index */}
      {index !== undefined && (
        <span className="w-6 text-center text-sm text-[var(--foreground-muted)] font-medium shrink-0">
          {index + 1}
        </span>
      )}
      
      {/* Logo */}
      <div className="shrink-0">
        <ToolLogo name={tool.name} logo={tool.logo} size="md" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
            {tool.name}
          </h3>
          {isNewTool(tool.createdAt) && (
            <span className="text-[10px] px-2 py-0.5 bg-[var(--accent-2-muted)] text-[var(--accent-2)] rounded-full font-medium">
              New
            </span>
          )}
          {isTrending && (
            <span className="text-xs" title="Trending">🔥</span>
          )}
        </div>
        <p className={`text-[var(--foreground-muted)] ${showDescription ? 'line-clamp-2 text-sm' : 'truncate text-sm'}`}>
          {showDescription ? tool.description : tool.tagline}
        </p>
      </div>
      
      {/* Category - hidden on mobile */}
      <span className="hidden md:block text-sm text-[var(--foreground-muted)] shrink-0">
        {tool.category.name}
      </span>
      
      {/* Pricing */}
      <span className={`text-xs font-medium ${pricingColors[tool.pricingTier]} shrink-0 hidden sm:block`}>
        {pricingLabels[tool.pricingTier]}
      </span>
      
      {/* Arrow */}
      <svg 
        className="w-5 h-5 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 
                   group-hover:translate-x-1 transition-all duration-200 shrink-0 hidden sm:block"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// Simpler row variant for dense lists
export function ToolRow({ tool, index }: { tool: Tool; index?: number }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-center gap-3 py-2.5 hover:opacity-70 transition-opacity"
    >
      {index !== undefined && (
        <span className={`w-5 text-sm font-bold ${index < 3 ? 'text-[var(--accent)]' : 'text-[var(--foreground-muted)]'}`}>
          {index + 1}
        </span>
      )}
      <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] truncate transition-colors">
        {tool.name}
      </span>
      <span className="text-xs text-[var(--foreground-muted)] ml-auto shrink-0">
        {pricingLabels[tool.pricingTier]}
      </span>
    </Link>
  );
}

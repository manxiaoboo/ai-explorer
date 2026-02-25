"use client";

import Link from "next/link";
import { useState } from "react";

interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: { name: string };
  pricingTier: 'FREE' | 'FREEMIUM' | 'PAID' | 'ENTERPRISE' | 'OPEN_SOURCE';
  githubStars?: number | null;
  productHuntVotes?: number | null;
  trendingScore: number;
  features: string[];
  logo?: string | null;
}

interface ToolCardProps {
  tool: Tool;
  compact?: boolean;
  featured?: boolean;
}

export function ToolCard({ tool, compact = false, featured = false }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const pricingConfig = {
    FREE: { label: "Free", class: "text-[var(--success)]" },
    FREEMIUM: { label: "Freemium", class: "text-[var(--warning)]" },
    PAID: { label: "Paid", class: "text-[var(--muted)]" },
    ENTERPRISE: { label: "Enterprise", class: "text-[var(--muted)]" },
    OPEN_SOURCE: { label: "Open Source", class: "text-[var(--success)]" },
  }[tool.pricingTier];

  // Featured variant - horizontal layout for homepage
  if (featured) {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="group block bg-[var(--surface)] rounded-lg border border-[var(--border)] 
                   hover:border-[var(--border-strong)] card-hover overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-stretch">
          {/* Icon */}
          <div className="w-20 sm:w-24 bg-[var(--background)] border-r border-[var(--border)] 
                          flex items-center justify-center flex-shrink-0"
          >
            <span className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)]">
              {tool.name[0]}
            </span>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] 
                             transition-colors truncate"
              >
                {tool.name}
              </h3>
              <span className={`text-xs font-medium flex-shrink-0 ${pricingConfig.class}`}>
                {pricingConfig.label}
              </span>
            </div>
            
            <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3">
              {tool.tagline}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
              <span>{tool.category.name}</span>
              {tool.githubStars && tool.githubStars > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {tool.githubStars.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (compact) {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="group block p-4 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border)] 
                   hover:border-[var(--border-strong)] card-hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-[var(--surface)] 
                          rounded-lg flex items-center justify-center text-[var(--foreground)] font-semibold text-base
                          border border-[var(--border)]"
          >
            {tool.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-[var(--foreground)] truncate group-hover:text-[var(--accent)] 
                             transition-colors duration-200"
              >
                {tool.name}
              </h3>
            </div>
            <p className="text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">{tool.tagline}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${pricingConfig.class}`}>
                {pricingConfig.label}
              </span>
              {tool.trendingScore > 80 && (
                <span className="text-xs text-[var(--accent)] font-medium">
                  Trending
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group block p-5 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border)]
                 hover:border-[var(--border-strong)] card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-[var(--surface)] 
                        rounded-lg flex items-center justify-center text-[var(--foreground)] text-lg font-semibold
                        border border-[var(--border)]"
        >
          {tool.name[0]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-base font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] 
                             transition-colors duration-200 mb-0.5"
              >
                {tool.name}
              </h3>
              <p className="text-sm text-[var(--muted)]">{tool.category.name}</p>
            </div>
            <span className={`flex-shrink-0 text-xs px-2 py-1 rounded font-medium ${pricingConfig.class}`}
            >
              {pricingConfig.label}
            </span>
          </div>
          
          <p className="text-[var(--muted)] mt-3 text-sm line-clamp-2 leading-relaxed">{tool.description}</p>
          
          <div className="flex items-center gap-4 mt-3 text-sm">
            {tool.githubStars && tool.githubStars > 0 && (
              <span className="flex items-center gap-1 text-[var(--muted-foreground)]"
                    aria-label={`${tool.githubStars.toLocaleString()} GitHub stars`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {tool.githubStars.toLocaleString()}
              </span>
            )}
            {tool.productHuntVotes && tool.productHuntVotes > 0 && (
              <span className="flex items-center gap-1 text-[var(--muted-foreground)]"
                    aria-label={`${tool.productHuntVotes} Product Hunt votes`}>
                🚀 {tool.productHuntVotes}
              </span>
            )}
            {tool.trendingScore > 80 && (
              <span className="text-[var(--accent)] font-medium text-xs">
                Trending
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

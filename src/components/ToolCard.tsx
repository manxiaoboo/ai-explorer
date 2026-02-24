"use client";

import Link from "next/link";
import Image from "next/image";
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
}

export function ToolCard({ tool, compact = false }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const pricingConfig = {
    FREE: { label: "Free", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    FREEMIUM: { label: "Freemium", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    PAID: { label: "Paid", class: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    ENTERPRISE: { label: "Enterprise", class: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
    OPEN_SOURCE: { label: "Open Source", class: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  }[tool.pricingTier];

  if (compact) {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="group block p-5 bg-[var(--surface)] rounded-xl border border-[var(--border)] 
                   hover:border-[var(--accent)]/30 transition-all duration-300 ease-[var(--ease-out-expo)]
                   hover:shadow-lg hover:shadow-[var(--accent)]/5 hover:-translate-y-0.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] 
                          rounded-lg flex items-center justify-center text-white font-bold text-lg
                          group-hover:scale-105 transition-transform duration-300">
            {tool.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] 
                             transition-colors duration-200">
                {tool.name}
              </h3>
            </div>
            <p className="text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">{tool.tagline}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs px-2.5 py-1 rounded-full border ${pricingConfig.class} font-medium`}>
                {pricingConfig.label}
              </span>
              {tool.trendingScore > 80 && (
                <span className="text-xs text-[var(--accent)] font-medium tabular-nums">
                  ↗ Trending
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
      className="group block p-6 bg-[var(--surface)] rounded-2xl border border-[var(--border)]
                 hover:border-[var(--accent)]/30 transition-all duration-500 ease-[var(--ease-out-expo)]
                 hover:shadow-2xl hover:shadow-[var(--accent)]/10 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] 
                        rounded-xl flex items-center justify-center text-white text-2xl font-bold
                        group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
        >
          {tool.name[0]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] 
                             transition-colors duration-200 mb-1">
                {tool.name}
              </h3>
              <p className="text-sm text-[var(--muted)] mb-2">{tool.category.name}</p>
            </div>
            <span className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border ${pricingConfig.class} font-medium`}
            >
              {pricingConfig.label}
            </span>
          </div>
          
          <p className="text-[var(--muted)] mt-3 line-clamp-2 leading-relaxed">{tool.description}</p>
          
          <div className="flex items-center gap-4 mt-4 text-sm">
            {tool.githubStars && tool.githubStars > 0 && (
              <span className="flex items-center gap-1.5 text-[var(--muted)] tabular-nums"
                    aria-label={`${tool.githubStars.toLocaleString()} GitHub stars`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {tool.githubStars.toLocaleString()}
              </span>
            )}
            {tool.productHuntVotes && tool.productHuntVotes > 0 && (
              <span className="flex items-center gap-1.5 text-[var(--muted)] tabular-nums"
                    aria-label={`${tool.productHuntVotes} Product Hunt votes`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" />
                </svg>
                {tool.productHuntVotes}
              </span>
            )}
            {tool.trendingScore > 80 && (
              <span className="text-[var(--accent)] font-medium text-xs tracking-wide uppercase"
                    aria-label="Trending tool">
                Trending
              </span>
            )}
          </div>
          
          {tool.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border)]"
                  aria-label="Key features">
              {tool.features.slice(0, 3).map((feature, index) => (
                <span
                  key={feature}
                  className="text-xs px-2.5 py-1 bg-[var(--surface-elevated)] text-[var(--muted)] rounded-md
                           border border-[var(--border)]"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

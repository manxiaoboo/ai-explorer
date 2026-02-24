"use client";

import Link from "next/link";

interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  pricingTier: 'FREE' | 'FREEMIUM' | 'PAID' | 'ENTERPRISE' | 'OPEN_SOURCE';
  githubStars?: number | null;
  trendingScore: number;
}

interface TrendingToolsProps {
  tools: Tool[];
}

export function TrendingTools({ tools }: TrendingToolsProps) {
  const getPricingLabel = (tier: string) => {
    const labels: Record<string, string> = {
      FREE: "Free",
      FREEMIUM: "Freemium",
      PAID: "Paid",
      ENTERPRISE: "Enterprise",
      OPEN_SOURCE: "Open Source",
    };
    return labels[tier] || tier;
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden"
    >
      <ul className="divide-y divide-[var(--border)]">
        {tools.map((tool, index) => (
          <li key={tool.id}>
            <Link
              href={`/tools/${tool.slug}`}
              className="group flex items-center gap-4 p-4 hover:bg-[var(--surface-elevated)] 
                       transition-all duration-200 focus-visible:ring-2 
                       focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
              aria-label={`${tool.name} - ${getPricingLabel(tool.pricingTier)}`}
            >
              <div className="flex-shrink-0 w-8 text-center font-[family-name:var(--font-display)] 
                              text-xl font-semibold text-[var(--muted)]"
              >
                {index + 1}
              </div>
              
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] 
                              rounded-lg flex items-center justify-center text-white font-bold
                              group-hover:scale-105 transition-transform duration-300"
              >
                {tool.name[0]}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--foreground)] truncate 
                                 group-hover:text-[var(--accent)] transition-colors duration-200"
                  >
                    {tool.name}
                  </h3>
                  {index < 3 && (
                    <span className="text-xs text-[var(--accent)] font-medium"
                          aria-label="Top trending"
                    >
                      ↗
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted)] truncate"
                >
                  {tool.tagline}
                </p>
              </div>
              
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-medium text-[var(--foreground)]"
                >
                  {getPricingLabel(tool.pricingTier)}
                </div>
                {tool.githubStars && tool.githubStars > 0 && (
                  <div className="text-xs text-[var(--muted)] tabular-nums flex items-center gap-1"
                        aria-label={`${tool.githubStars.toLocaleString()} stars`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {tool.githubStars.toLocaleString()}
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

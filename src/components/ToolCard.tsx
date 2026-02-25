"use client";

import Link from "next/link";
import { useState } from "react";
import { ToolLogo } from "./ToolLogo";

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
  const isTrending = tool.trendingScore > 80;
  
  const pricingConfig = {
    FREE: { label: "Free", class: "text-emerald-600 bg-emerald-50" },
    FREEMIUM: { label: "Freemium", class: "text-amber-600 bg-amber-50" },
    PAID: { label: "Paid", class: "text-slate-600 bg-slate-100" },
    ENTERPRISE: { label: "Enterprise", class: "text-slate-600 bg-slate-100" },
    OPEN_SOURCE: { label: "Open Source", class: "text-sky-600 bg-sky-50" },
  }[tool.pricingTier];

  // Featured variant - horizontal layout for homepage
  if (featured) {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="group relative block bg-white rounded-xl border border-slate-200 
                   hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50
                   transition-all duration-300 ease-out
                   hover:-translate-y-0.5 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Trending badge - fixed top right */}
        {isTrending && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium 
                             bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-sm">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Trending
            </span>
          </div>
        )}

        <div className="flex items-stretch">
          {/* Logo */}
          <div className="w-24 sm:w-28 flex-shrink-0 bg-slate-50 flex items-center justify-center
                          group-hover:bg-slate-100 transition-colors duration-300">
            <ToolLogo name={tool.name} size="lg" />
          </div>
          
          {/* Content */}
          <div className="flex-1 p-5 min-w-0 pr-24">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 
                             transition-colors truncate text-lg">
                {tool.name}
              </h3>
            </div>
            
            <p className="text-slate-600 line-clamp-2 mb-4 leading-relaxed">
              {tool.tagline}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pricingConfig.class}`}>
                  {pricingConfig.label}
                </span>
                
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  {tool.category.name}
                </span>
              </div>
              
              <span className="text-slate-400 group-hover:text-orange-500 
                               group-hover:translate-x-1 transition-all duration-200">
                →
              </span>
            </div>          
          </div>        
        </div>
        
        {/* Bottom accent line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500
                        transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </Link>
    );
  }

  // Compact variant - for grids
  if (compact) {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="group relative block p-4 bg-white rounded-xl border border-slate-200 
                   hover:border-slate-300 hover:shadow-md
                   transition-all duration-200 ease-out
                   hover:-translate-y-0.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Trending badge - fixed top right */}
        {isTrending && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium 
                             bg-orange-500 text-white rounded-full shadow-sm">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Trending
            </span>
          </div>
        )}

        <div className="flex items-start gap-3 pr-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <ToolLogo name={tool.name} size="md" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 
                           transition-colors truncate mb-1">
              {tool.name}
            </h3>
            
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-2">
              {tool.tagline}
            </p>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pricingConfig.class}`}>
                {pricingConfig.label}
              </span>
              
              <span className="text-slate-300 group-hover:text-orange-400 group-hover:translate-x-0.5 
                               transition-all duration-200 text-sm">
                →
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative block p-5 bg-white rounded-xl border border-slate-200
                 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50
                 transition-all duration-300 ease-out
                 hover:-translate-y-1 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Trending badge - fixed top right */}
      {isTrending && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                           bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-sm">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Trending
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <ToolLogo name={tool.name} size="lg" />
        </div>
        
        <div className="flex-1 min-w-0 pr-24">
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-orange-600 
                           transition-colors">
              {tool.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pricingConfig.class}`}>
              {pricingConfig.label}
            </span>
            
            <span className="text-sm text-slate-500 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              {tool.category.name}
            </span>
          </div>
          
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500
                      transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  );
}

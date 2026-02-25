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

// Generate a subtle gradient based on tool name
function getGradient(name: string): string {
  const gradients = [
    "from-orange-400/20 to-amber-500/20",
    "from-blue-400/20 to-cyan-500/20", 
    "from-emerald-400/20 to-teal-500/20",
    "from-violet-400/20 to-purple-500/20",
    "from-rose-400/20 to-pink-500/20",
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export function ToolCard({ tool, compact = false, featured = false }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const pricingConfig = {
    FREE: { label: "Free", class: "text-emerald-600 bg-emerald-50" },
    FREEMIUM: { label: "Freemium", class: "text-amber-600 bg-amber-50" },
    PAID: { label: "Paid", class: "text-slate-600 bg-slate-100" },
    ENTERPRISE: { label: "Enterprise", class: "text-slate-600 bg-slate-100" },
    OPEN_SOURCE: { label: "Open Source", class: "text-sky-600 bg-sky-50" },
  }[tool.pricingTier];

  const gradient = getGradient(tool.name);

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
        <div className="flex items-stretch">
          {/* Icon with gradient background */}
          <div className={`w-24 sm:w-28 bg-gradient-to-br ${gradient} 
                          flex items-center justify-center flex-shrink-0
                          group-hover:scale-105 transition-transform duration-500`}
          >
            <span className="text-3xl sm:text-4xl font-bold text-slate-700
                             group-hover:rotate-3 transition-transform duration-300"
            >
              {tool.name[0]}
            </span>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-5 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 
                             transition-colors truncate text-lg"
              >
                {tool.name}
              </h3>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${pricingConfig.class}`}>
                {pricingConfig.label}
              </span>
            </div>
            
            <p className="text-slate-600 line-clamp-2 mb-4 leading-relaxed">
              {tool.tagline}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  {tool.category.name}
                </span>
                
                {tool.githubStars && tool.githubStars > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {tool.githubStars.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Arrow indicator */}
              <span className="text-slate-400 group-hover:text-orange-500 
                               group-hover:translate-x-1 transition-all duration-200"
              >
                →
              </span>
            </div>
          </div>        
        </div>
        
        {/* Bottom accent line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500
                        transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" 
        />
      </Link>
    );
  }

  // Compact variant - for grids
  if (compact) {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="group block p-4 bg-white rounded-xl border border-slate-200 
                   hover:border-slate-300 hover:shadow-md
                   transition-all duration-200 ease-out
                   hover:-translate-y-0.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br ${gradient}
                          flex items-center justify-center text-slate-700 font-bold text-lg
                          group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
          >
            {tool.name[0]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 
                             transition-colors truncate"
              >
                {tool.name}
              </h3>
              
              {tool.trendingScore > 80 && (
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 animate-pulse"
                      title="Trending"
                />
              )}
            </div>
            
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-2">
              {tool.tagline}
            </p>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pricingConfig.class}`}>
                {pricingConfig.label}
              </span>
              
              <span className="text-slate-300 group-hover:text-orange-400 group-hover:translate-x-0.5 
                               transition-all duration-200 text-sm"
              >
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
      className="group block p-5 bg-white rounded-xl border border-slate-200
                 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50
                 transition-all duration-300 ease-out
                 hover:-translate-y-1 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${gradient}
                        flex items-center justify-center text-slate-700 text-2xl font-bold
                        group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
        >
          {tool.name[0]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-orange-600 
                             transition-colors mb-0.5"
              >
                {tool.name}
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                {tool.category.name}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pricingConfig.class}`}
              >
                {pricingConfig.label}
              </span>
              
              {tool.trendingScore > 80 && (
                <span className="text-xs font-medium text-orange-600 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  Trending
                </span>
              )}
            </div>
          </div>
          
          <p className="text-slate-600 mt-3 text-sm line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {tool.githubStars && tool.githubStars > 0 && (
                <span className="flex items-center gap-1"
                      aria-label={`${tool.githubStars.toLocaleString()} GitHub stars`}
                >
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {tool.githubStars.toLocaleString()}
                </span>
              )}
              
              {tool.productHuntVotes && tool.productHuntVotes > 0 && (
                <span className="flex items-center gap-1"
                      aria-label={`${tool.productHuntVotes} Product Hunt votes`}
                >
                  🚀 {tool.productHuntVotes}
                </span>
              )}
            </div>
            
            <span className="text-slate-300 group-hover:text-orange-500 
                             group-hover:translate-x-1 transition-all duration-200"
            >
              View →
            </span>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500
                      transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" 
      />
    </Link>
  );
}

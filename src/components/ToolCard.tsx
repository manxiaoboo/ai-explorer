"use client";

import Link from "next/link";
import Image from "next/image";

interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: { name: string };
  pricingTier: 'FREE' | 'FREEMIUM' | 'PAID' | 'ENTERPRISE' | 'OPEN_SOURCE';
  githubStars?: number;
  productHuntVotes?: number;
  trendingScore: number;
  features: string[];
  logo?: string;
}

interface ToolCardProps {
  tool: Tool;
  compact?: boolean;
}

export function ToolCard({ tool, compact = false }: ToolCardProps) {
  const pricingLabel = {
    FREE: "Free",
    FREEMIUM: "Freemium",
    PAID: "Paid",
    ENTERPRISE: "Enterprise",
    OPEN_SOURCE: "Open Source",
  }[tool.pricingTier];

  const pricingColor = {
    FREE: "bg-green-100 text-green-800",
    FREEMIUM: "bg-blue-100 text-blue-800",
    PAID: "bg-purple-100 text-purple-800",
    ENTERPRISE: "bg-orange-100 text-orange-800",
    OPEN_SOURCE: "bg-gray-100 text-gray-800",
  }[tool.pricingTier];

  if (compact) {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-3">
          {tool.logo ? (
            <Image
              src={tool.logo}
              alt={tool.name}
              width={40}
              height={40}
              className="rounded-lg"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold">
              {tool.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{tool.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{tool.tagline}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${pricingColor}`}>
                {pricingLabel}
              </span>
              {tool.trendingScore > 50 && (
                <span className="text-xs text-orange-600">🔥 Trending</span>
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
      className="block p-6 border rounded-xl hover:shadow-lg transition-shadow bg-white"
    >
      <div className="flex items-start gap-4">
        {tool.logo ? (
          <Image
            src={tool.logo}
            alt={tool.name}
            width={64}
            height={64}
            className="rounded-xl"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            {tool.name[0]}
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
              <p className="text-sm text-gray-500">{tool.category.name}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${pricingColor}`}>
              {pricingLabel}
            </span>
          </div>
          
          <p className="text-gray-600 mt-3 line-clamp-2">{tool.description}</p>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            {tool.githubStars && tool.githubStars > 0 && (
              <span className="flex items-center gap-1">
                ⭐ {tool.githubStars.toLocaleString()}
              </span>
            )}
            {tool.productHuntVotes && tool.productHuntVotes > 0 && (
              <span className="flex items-center gap-1">
                🚀 {tool.productHuntVotes}
              </span>
            )}
            {tool.trendingScore > 50 && (
              <span className="text-orange-600 font-medium">🔥 Trending</span>
            )}
          </div>
          
          {tool.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tool.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
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

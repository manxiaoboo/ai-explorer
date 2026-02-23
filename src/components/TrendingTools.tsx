"use client";

import Link from "next/link";
import { Tool, Category } from "@prisma/client";

interface ToolWithCategory extends Tool {
  category: Category;
}

interface TrendingToolsProps {
  tools: ToolWithCategory[];
}

export function TrendingTools({ tools }: TrendingToolsProps) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="divide-y">
        {tools.map((tool, index) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 text-center font-bold text-gray-400">
              {index + 1}
            </div>
            
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              {tool.name[0]}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">{tool.name}</h3>
                {index < 3 && (
                  <span className="text-xs">🔥</span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{tool.tagline}</p>
            </div>
            
            <div className="flex-shrink-0 text-right">
              <div className="text-sm font-medium text-gray-900">
                {tool.pricingTier === "FREE" ? "Free" : tool.pricingTier === "FREEMIUM" ? "Freemium" : "Paid"}
              </div>
              {tool.githubStars > 0 && (
                <div className="text-xs text-gray-500">⭐ {tool.githubStars.toLocaleString()}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

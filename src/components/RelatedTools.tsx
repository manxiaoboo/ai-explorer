'use client';

import Link from "next/link";
import { ToolLogo } from "./ToolLogo";

interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo: string | null;
  mentions: number;
}

interface RelatedToolsProps {
  tools: Tool[];
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;
  
  return (
    <aside className="bg-slate-50 rounded-xl border border-slate-200 p-5 my-8">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <h3 className="font-semibold text-slate-900">Related Tools</h3>
      </div>
      
      <div className="space-y-3">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 
                     hover:border-orange-300 hover:shadow-sm transition-all group"
          >
            <ToolLogo name={tool.name} logo={tool.logo} size="sm" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 group-hover:text-orange-600 text-sm">
                  {tool.name}
                </span>
                {tool.mentions > 1 && (
                  <span className="text-xs text-slate-400">
                    mentioned {tool.mentions}×
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {tool.tagline}
              </p>
            </div>
            
            <span className="text-slate-300 group-hover:text-orange-500 transition-colors">→</span>
          </Link>
        ))}
      </div>
      
      <p className="text-xs text-slate-400 mt-4">
        Tools mentioned in this article. Explore more in our directory.
      </p>
    </aside>
  );
}

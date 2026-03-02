import Link from "next/link";

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleSidebarProps {
  tools: any[];
  tableOfContents: TableOfContentsItem[];
  source?: string | null;
  originalUrl?: string | null;
}

// Extract headings from HTML content for TOC
export function extractTableOfContents(content: string): TableOfContentsItem[] {
  if (!content) return [];
  
  const headings: TableOfContentsItem[] = [];
  const headingRegex = /<(h[2-3])[^>]*>(.*?)<\/\1>/gi;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1] === 'h2' ? 2 : 3;
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
    
    if (text && text.length > 5) {
      headings.push({ id, text, level });
    }
  }
  
  return headings.slice(0, 8); // Limit to 8 items
}

export function ArticleSidebar({ tools, tableOfContents, source, originalUrl }: ArticleSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Table of Contents - SEO: Improves page structure and internal linking */}
      {tableOfContents.length > 0 && (
        <nav className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5"
             aria-label="Table of contents">
          <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4">
            Contents
          </h3>
          <ul className="space-y-2">
            {tableOfContents.map((item, idx) => (
              <li key={idx} className={item.level === 3 ? 'ml-4' : ''}>
                <a 
                  href={`#${item.id}`}
                  className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors block py-1"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Related Tools - SEO: Internal linking to tool pages */}
      {tools.length > 0 && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4">
            Mentioned Tools
          </h3>
          <div className="space-y-3">
            {tools.map((tool: any) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-[var(--accent)]/5 transition-colors group"
              >
                {tool.logo ? (
                  <img src={tool.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-xs font-bold text-[var(--accent)]">
                    {tool.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--foreground)] text-sm group-hover:text-[var(--accent)] truncate">
                    {tool.name}
                  </div>
                  <div className="text-xs text-[var(--muted)] truncate">
                    {tool.tagline}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Share & Save - SEO: Social signals */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4">
          Share
        </h3>
        <div className="flex gap-2">
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this article')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg text-center text-sm font-medium hover:bg-[#1DA1F2]/20 transition-colors"
          >
            Twitter
          </a>
          <a 
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 bg-[#0A66C2]/10 text-[#0A66C2] rounded-lg text-center text-sm font-medium hover:bg-[#0A66C2]/20 transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>

      {/* Source Info - SEO: E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) */}
      {(source || originalUrl) && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-3">
            Source
          </h3>
          <p className="text-sm text-[var(--muted)] mb-3">
            This article was originally published by {source || 'our editorial team'}.
          </p>
          {originalUrl && (
            <a 
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              Read original article
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Newsletter - SEO: Engagement signal */}
      <div className="bg-[var(--accent)]/5 rounded-xl border border-[var(--accent)]/20 p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-2">
          AI News Weekly
        </h3>
        <p className="text-xs text-[var(--muted)] mb-3">
          Get the latest AI tools and news delivered to your inbox.
        </p>
        <Link 
          href="/news"
          className="block w-full py-2 bg-[var(--accent)] text-white text-center rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Browse All News
        </Link>
      </div>

      {/* Categories - SEO: Internal linking */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {['AI Tools', 'Machine Learning', 'Generative AI', 'AI News'].map((cat) => (
            <Link
              key={cat}
              href={`/news`}
              className="px-3 py-1 bg-[var(--background)] border border-[var(--border)] rounded-full text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

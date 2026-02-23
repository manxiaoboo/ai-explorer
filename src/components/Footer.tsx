import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Browse": [
      { href: "/tools", label: "All Tools" },
      { href: "/news", label: "AI News" },
      { href: "/free-ai-tools", label: "Free Tools" },
      { href: "/trending", label: "Trending" },
    ],
    "Categories": [
      { href: "/category/ai-writing", label: "AI Writing" },
      { href: "/category/ai-image", label: "AI Image" },
      { href: "/category/ai-code", label: "AI Coding" },
      { href: "/category/ai-chat", label: "AI Chat" },
    ],
    "Resources": [
      { href: "/about", label: "About" },
      { href: "/submit", label: "Submit Tool" },
      { href: "/api", label: "API" },
    ],
  };

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1"
          >
            <Link href="/" className="flex items-center gap-2 mb-4"
                  aria-label="AI Tools Hub"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] rounded-lg flex items-center justify-center text-white font-bold"
              >
                AI
              </div>
              <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)]"
              >
                Tools Hub
              </span>
            </Link>
            <p className="text-[var(--muted)] text-sm leading-relaxed"
            >
              Discover the best AI tools for your workflow. Curated, categorized, and always up to date.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}
            >
              <h3 className="font-semibold text-[var(--foreground)] mb-4"
              >{title}</h3>
              <ul className="space-y-2"
              >
                {links.map((link) => (
                  <li key={link.href}
                  >
                    <Link
                      href={link.href}
                      className="text-[var(--muted)] hover:text-[var(--accent)] text-sm transition-colors
                               focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
                               focus-visible:ring-offset-[var(--surface)] rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-[var(--muted)] text-sm"
          >
            © {currentYear} AI Tools Hub. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6"
          >
            <Link href="/privacy" className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms" className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

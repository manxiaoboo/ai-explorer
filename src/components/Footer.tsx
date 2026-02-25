import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Browse": [
      { href: "/tools", label: "All Tools" },
      { href: "/news", label: "News" },
      { href: "/free-ai-tools", label: "Free" },
      { href: "/trending", label: "Trending" },
    ],
    "Categories": [
      { href: "/category/writing", label: "Writing" },
      { href: "/category/image", label: "Image" },
      { href: "/category/code", label: "Code" },
      { href: "/category/chat", label: "Chat" },
    ],
    "Resources": [
      { href: "/about", label: "About" },
      { href: "/submit", label: "Submit" },
      { href: "/api", label: "API" },
    ],
  };

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="Tooli">
              <div className="w-7 h-7 bg-[var(--foreground)] rounded flex items-center justify-center text-[var(--background)] font-bold text-sm">
                T
              </div>
              <span className="text-lg font-semibold text-[var(--foreground)]">
                Tooli
              </span>
            </Link>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              Find the perfect tool for your workflow. Curated, categorized, always up to date.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-medium text-[var(--foreground)] mb-4 text-sm tracking-wide uppercase">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--muted)] hover:text-[var(--accent)] text-sm transition-colors"
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
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[var(--muted)] text-sm">
            © {currentYear} Tooli
          </p>
          
          <div className="flex items-center gap-6">
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

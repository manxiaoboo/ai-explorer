import Link from "next/link";
import { SearchBox } from "./SearchBox";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface HeroSectionProps {
  categories: Category[];
}

export function HeroSection({ categories }: HeroSectionProps) {
  const quickLinks = [
    { label: "Writing", href: "/category/writing" },
    { label: "Image", href: "/category/image" },
    { label: "Code", href: "/category/code" },
    { label: "Chat", href: "/category/chat" },
    { label: "Free Tools", href: "/free-ai-tools" },
  ];

  return (
    <section className="bg-[var(--background)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Main Message */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-[2px] bg-[var(--accent)]"></span>
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                AI Tools Directory
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[var(--foreground)] mb-6 tracking-tight">
              Find the perfect tool{" "}
              <span className="text-[var(--accent)]">for any task</span>
            </h1>

            <p className="text-lg text-[var(--muted)] mb-8 max-w-lg">
              500+ curated AI tools. No fluff, no paid placements — just honest info to help you decide.
            </p>

            <div className="max-w-md">
              <SearchBox />
            </div>
          </div>

          {/* Right - Quick Navigation */}
          <div className="lg:pl-8">
            <div className="bg-[var(--surface)] rounded-lg p-6">
              <h2 className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
                Popular Categories
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between px-4 py-3 bg-[var(--background)] 
                               border border-[var(--border)] rounded hover:border-[var(--accent)] 
                               transition-colors group"
                  >
                    <span className="text-sm text-[var(--foreground)]">{link.label}</span>
                    <span className="text-[var(--muted)] group-hover:text-[var(--accent)]">→</span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <Link 
                  href="/tools" 
                  className="flex items-center justify-between text-sm text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  <span>Browse all categories</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

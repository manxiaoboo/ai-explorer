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
  const tags = ["Writing", "Image", "Code", "Chat", "Audio"];

  return (
    <section className="relative bg-[var(--background)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Top label */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-[2px] bg-[var(--accent)]"></span>
          <span className="text-sm font-medium text-[var(--muted)] tracking-wide uppercase">
            AI Tools Directory
          </span>
        </div>

        {/* Main heading - Swiss typography */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[var(--foreground)] mb-6 tracking-tight max-w-3xl">
          Find the perfect tool{" "}
          <span className="text-[var(--accent)]">for any task</span>.
        </h1>

        {/* Subheading - clean, direct */}
        <p className="text-lg md:text-xl text-[var(--muted)] mb-12 max-w-2xl leading-relaxed">
          Curated collection of 500+ AI tools. No fluff, no paid placements — just honest reviews and up-to-date info.
        </p>

        {/* Search box */}
        <div className="max-w-xl mb-12">
          <SearchBox />
        </div>

        {/* Quick filters - pill style */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--muted-foreground)] mr-2">Popular:</span>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tools?tag=${tag.toLowerCase()}`}
              className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-subtle)] 
                         border border-[var(--border)] hover:border-[var(--border-strong)]
                         rounded-full text-sm text-[var(--foreground)] 
                         transition-colors duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

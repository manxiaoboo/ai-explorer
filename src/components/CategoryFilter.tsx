"use client";

import Link from "next/link";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  return (
    <nav 
      className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5"
      aria-label="Category filter"
    >
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground)] mb-4"
      >
        Categories
      </h3>
      
      <ul className="space-y-1">
        <li>
          <Link
            href="/tools"
            className="block px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]
                     hover:bg-[var(--surface-elevated)] transition-all duration-200
                     focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
          >
            All Categories
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/category/${category.slug}`}
              className="block px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]
                       hover:bg-[var(--surface-elevated)] transition-all duration-200
                       focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
              aria-label={`Browse ${category.name} tools`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

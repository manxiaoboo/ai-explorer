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
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
      <nav className="space-y-1">
        <Link
          href="/tools"
          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          All Categories
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

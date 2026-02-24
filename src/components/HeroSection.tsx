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
  const tags = ["#Customer Service", "#Chatbot", "#Image Generator", "#Education", "#Writing Assistant"];

  return (
    <section className="relative bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
        {/* Tagline badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-slate-600 rounded-full text-sm font-medium text-slate-300">
          <span className="text-orange-400">✦</span>
          <span>ENHANCE</span>
          <span className="text-slate-500">•</span>
          <span>INNOVATE</span>
          <span className="text-slate-500">•</span>
          <span>ACHIEVE</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          Find the Best{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
            AI Tools
          </span>
          !
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Explore a huge, always-growing library of AI tools — all with reviews from users.
        </p>

        {/* Search box */}
        <div className="max-w-xl mx-auto mb-16">
          <SearchBox />
        </div>

        {/* Category buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="px-4 py-3 bg-slate-800/50 backdrop-blur border border-slate-600 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-700 hover:border-orange-400 transition-all"
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Tag buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tools?tag=${tag.replace('#', '')}`}
              className="px-4 py-2 bg-slate-800/30 hover:bg-orange-500/20 rounded-lg text-sm text-slate-400 hover:text-orange-300 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

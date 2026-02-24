import Link from "next/link";

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
    <section className="relative bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-20 left-0 right-0 h-64 bg-gradient-to-t from-lime-200/50 to-transparent" 
             style={{ 
               borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
               transform: 'scaleX(1.5)'
             }} 
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
        {/* Tagline badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-gray-200 rounded-full text-sm font-medium text-gray-700">
          <span className="text-lime-500">✦</span>
          <span>ENHANCE</span>
          <span className="text-gray-300">•</span>
          <span>INNOVATE</span>
          <span className="text-gray-300">•</span>
          <span>ACHIEVE</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
          Find the Best AI Tools!
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Explore a huge, always-growing library of AI tools — all with reviews from users.
        </p>

        {/* Search box */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="relative">
            <input
              type="text"
              placeholder="Category, Use Case, Interest..."
              className="w-full px-6 py-4 pr-14 text-gray-700 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:border-lime-400 transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-lime-400 hover:bg-lime-500 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-lime-400 hover:text-gray-900 transition-all"
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
              className="px-4 py-2 bg-gray-100 hover:bg-lime-100 rounded-lg text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

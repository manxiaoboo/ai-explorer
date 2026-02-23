import Link from "next/link";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Discover the Best AI Tools
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Browse 500+ AI tools with pricing, reviews, and trending scores. 
          Find free alternatives and compare features.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/tools"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse All Tools
          </Link>
          <Link
            href="/free-ai-tools"
            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            🆓 Free Tools
          </Link>
        </div>
        
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">500+</span>
            <span>AI Tools</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">20+</span>
            <span>Categories</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">120+</span>
            <span>Free Tools</span>
          </div>
        </div>
      </div>
    </section>
  );
}

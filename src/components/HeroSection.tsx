import Link from "next/link";
import { SearchBox } from "./SearchBox";

export function HeroSection() {
  const quickLinks = [
    { label: "Writing", href: "/category/writing" },
    { label: "Image", href: "/category/image" },
    { label: "Code", href: "/category/code" },
    { label: "Chat", href: "/category/chat" },
    { label: "Free Tools", href: "/free-ai-tools" },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left - Search & Main Message */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-[2px] bg-orange-500"></span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                AI Tools Directory
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Find the perfect tool<br />
              <span className="text-orange-600">for any task</span>
            </h1>

            <p className="text-slate-600 mb-6">
              500+ curated AI tools. No fluff, no paid placements.
            </p>

            <div className="max-w-md mb-6">
              <SearchBox />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500">Popular:</span>
              {quickLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-600 
                             hover:border-orange-300 hover:text-orange-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right - Quick Access Panel */}
          <div className="lg:pl-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
                Quick Access
              </h2>
              
              <div className="space-y-2">
                <Link
                  href="/tools"
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-white rounded flex items-center justify-center text-lg">🔍</span>
                    <div>
                      <div className="font-medium text-slate-900">Browse All</div>
                      <div className="text-xs text-slate-500">Explore 500+ tools</div>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-orange-500">→</span>
                </Link>

                <Link
                  href="/trending"
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-white rounded flex items-center justify-center text-lg">🔥</span>
                    <div>
                      <div className="font-medium text-slate-900">Trending</div>
                      <div className="text-xs text-slate-500">What&apos;s hot now</div>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-orange-500">→</span>
                </Link>

                <Link
                  href="/free-ai-tools"
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-white rounded flex items-center justify-center text-lg">🆓</span>
                    <div>
                      <div className="font-medium text-slate-900">Free Tools</div>
                      <div className="text-xs text-slate-500">No credit card</div>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-orange-500">→</span>
                </Link>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link
                  href="/submit"
                  className="flex items-center justify-center gap-2 w-full p-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <span>📤</span>
                  <span className="font-medium">Submit Your Tool</span>
                </Link>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Get in front of thousands of users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

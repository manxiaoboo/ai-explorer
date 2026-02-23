import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden noise-overlay">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--accent)_0%,_transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--accent-soft)_0%,_transparent_40%)] opacity-10" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-[var(--accent)] text-sm font-medium tracking-[0.2em] uppercase mb-6">
          Curated Directory
        </p>
        
        <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl lg:text-8xl font-semibold 
                       text-[var(--foreground)] mb-8 leading-[0.95] text-balance">
          Discover the
          <br />
          <span className="gradient-text italic">Best AI Tools</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-12 leading-relaxed text-pretty">
          Browse 500+ AI tools with pricing, reviews, and trending scores.
          Find free alternatives and compare features.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/tools"
            className="group relative px-8 py-4 bg-[var(--accent)] text-[var(--background)] rounded-lg 
                       font-semibold text-lg overflow-hidden transition-all duration-300
                       hover:shadow-lg hover:shadow-[var(--accent)]/25 hover:-translate-y-0.5
                       focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 
                       focus-visible:ring-offset-[var(--background)]"
            aria-label="Browse all AI tools"
          >
            <span className="relative z-10">Browse All Tools</span>
            <div className="absolute inset-0 bg-[var(--accent-soft)] translate-y-full 
                          group-hover:translate-y-0 transition-transform duration-300 ease-[var(--ease-out-expo)]" />
          </Link>
          
          <Link
            href="/free-ai-tools"
            className="px-8 py-4 border border-[var(--border)] text-[var(--foreground)] rounded-lg 
                       font-semibold text-lg hover:border-[var(--accent)]/50 hover:text-[var(--accent)]
                       transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                       focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            aria-label="Browse free AI tools"
          >
            Free Tools
          </Link>
        </div>
        
        {/* Stats */}
        <div className="mt-16 pt-8 border-t border-[var(--border)]/50">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: "500+", label: "AI Tools" },
              { value: "20+", label: "Categories" },
              { value: "120+", label: "Free Tools" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-semibold 
                                text-[var(--foreground)] tabular-nums">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--muted)] mt-1 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
           aria-hidden="true">
        <svg className="w-6 h-6 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

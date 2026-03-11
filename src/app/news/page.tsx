import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "AI News & Insights - Atooli",
  description: "The latest in AI — tools, trends, and what actually matters. Curated updates without the hype.",
  alternates: {
    canonical: "/news",
  },
};

async function getNewsArticles() {
  return prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NewsPage() {
  const newsArticles = await getNewsArticles();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI News & Insights",
    description: "The latest in AI — tools, trends, and what actually matters.",
    url: "https://tooli.ai/news",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: newsArticles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://tooli.ai/news/${article.slug}`,
        name: article.title,
      })),
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">AI News</span>
        </nav>

        {/* Header */}
        <header className="mb-12 pb-8 border-b border-[var(--border-soft)]">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4">
            News & Insights
          </h1>
          <p className="text-lg text-[var(--foreground-muted)] max-w-2xl">
            What&apos;s happening in AI — the tools worth knowing about, 
            the trends that matter, and the noise to ignore.
          </p>
        </header>

        {/* Articles List */}
        {newsArticles.length > 0 ? (
          <div className="space-y-8">
            {newsArticles.map((article) => (
              <article key={article.id}>
                <Link 
                  href={`/news/${article.slug}`}
                  className="group block py-6 -mx-4 px-4 rounded-xl hover:bg-[var(--surface-warm)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 text-sm text-[var(--foreground-muted)]">
                        <span>{formatDate(article.publishedAt)}</span>
                        {article.source && (
                          <>
                            <span>·</span>
                            <span className="text-[var(--accent)]">{article.source}</span>
                          </>
                        )}
                      </div>
                      
                      <h2 className="text-xl md:text-2xl font-semibold text-[var(--foreground)] 
                                     group-hover:text-[var(--accent)] transition-colors mb-3"
                      >
                        {article.title}
                      </h2>
                      
                      {article.excerpt && (
                        <p className="text-[var(--foreground-muted)] line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                    
                    <svg className="w-6 h-6 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 
                                   group-hover:translate-x-1 transition-all shrink-0 mt-1"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[var(--foreground-muted)]">No articles yet. Check back soon!</p>
          </div>
        )}
      </div>
    </>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "AI News - Latest Updates in Artificial Intelligence",
  description: "Stay updated with the latest AI news, trends, and insights. Expert analysis on AI tools, industry developments, and emerging technologies.",
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
  
  const featuredArticles = newsArticles.filter((a) => a.coverImage);
  const recentArticles = newsArticles.filter((a) => !a.coverImage);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI News",
    description: "Latest updates in artificial intelligence",
    url: "https://aitools.example.com/news",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: newsArticles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://aitools.example.com/news/${article.slug}`,
        name: article.title,
      })),
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium rounded-full"
            >
              News
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-semibold text-[var(--foreground)] mb-4"
          >
            AI News & Insights
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl">
            Stay updated with the latest developments in artificial intelligence. 
            Expert analysis, industry trends, and in-depth guides.
          </p>
        </header>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mb-6"
            >
              Featured Stories
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredArticles.map((article) => (
                <article
                  key={article.id}
                  className="group relative bg-[var(--surface)] rounded-2xl border border-[var(--border)] 
                           overflow-hidden hover:border-[var(--accent)]/30 
                           transition-all duration-300 hover:-translate-y-1"
                >
                  <Link href={`/news/${article.slug}`}>
                    <div className="aspect-video bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-soft)]/20 
                                    flex items-center justify-center"
                    >
                      {article.coverImage ? (
                        <img 
                          src={article.coverImage} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-6xl">📰</span>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-[var(--muted)]">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)] 
                                     mb-2 group-hover:text-[var(--accent)] transition-colors"
                      >
                        {article.title}
                      </h3>
                      
                      <p className="text-[var(--muted)] line-clamp-2 mb-4"
                      >
                        {article.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Recent Articles */}
        {recentArticles.length > 0 && (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mb-6"
            >
              Latest Articles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <article
                  key={article.id}
                  className="group bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5
                           hover:border-[var(--accent)]/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Link href={`/news/${article.slug}`}>
                    <div className="flex items-center gap-3 mb-3"
                    >
                      <span className="text-xs text-[var(--muted)]"
                      >
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-[var(--foreground)] mb-2 
                                   group-hover:text-[var(--accent)] transition-colors line-clamp-2"
                    >
                      {article.title}
                    </h3>
                    
                    <p className="text-sm text-[var(--muted)] line-clamp-2 mb-4"
                    >
                      {article.excerpt}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {newsArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--muted)]">No articles yet. Check back soon!</p>
          </div>
        )}
      </div>
    </>
  );
}

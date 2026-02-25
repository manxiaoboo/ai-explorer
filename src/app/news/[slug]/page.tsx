import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";

interface NewsArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getArticle(slug: string) {
  return prisma.news.findUnique({
    where: { slug, isPublished: true },
  });
}

async function getRelatedArticles(currentSlug: string) {
  return prisma.news.findMany({
    where: { 
      isPublished: true,
      slug: { not: currentSlug },
    },
    take: 3,
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

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    return { title: "Article Not Found" };
  }
  
  return {
    title: `${article.title} | AI News`,
    description: article.excerpt,
    alternates: {
      canonical: `/news/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(slug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage || "https://tooli.ai/news-default.jpg",
    datePublished: article.publishedAt?.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "Tooli",
      logo: {
        "@type": "ImageObject",
        url: "https://tooli.ai/logo.png",
      },
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[var(--muted)]">
              {formatDate(article.publishedAt)}
            </span>
          </div>
          
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-4 leading-tight"
          >
            {article.title}
          </h1>
          
          <p className="text-xl text-[var(--muted)] leading-relaxed"
          >
            {article.excerpt}
          </p>
        </header>

        {/* Featured Image */}
        {article.coverImage && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8">
            <img 
              src={article.coverImage} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none
                     prose-headings:font-[family-name:var(--font-display)]
                     prose-headings:text-[var(--foreground)]
                     prose-p:text-[var(--muted)]
                     prose-strong:text-[var(--foreground)]
                     prose-a:text-[var(--accent)]
                     prose-a:no-underline
                     prose-a:hover:underline"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mb-6"
            >
              Related Articles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <article
                  key={related.id}
                  className="group bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5
                           hover:border-[var(--accent)]/30 transition-all duration-300"
                >
                  <Link href={`/news/${related.slug}`}>
                    <div className="text-xs text-[var(--accent)] font-medium uppercase tracking-wider mb-2"
                    >
                      {formatDate(related.publishedAt)}
                    </div>
                    
                    <h3 className="font-semibold text-[var(--foreground)] mb-2 
                                   group-hover:text-[var(--accent)] transition-colors line-clamp-2"
                    >
                      {related.title}
                    </h3>
                    
                    <p className="text-sm text-[var(--muted)] line-clamp-2"
                    >
                      {related.excerpt}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

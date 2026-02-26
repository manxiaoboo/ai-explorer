import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";
import { RelatedTools } from "@/components/RelatedTools";

interface NewsArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Force dynamic rendering to avoid build-time DB connection
export const dynamic = 'force-dynamic';

async function getArticle(slug: string) {
  try {
    return await prisma.news.findUnique({
      where: { slug, isPublished: true },
      include: {
        mentions: {
          include: {
            tool: {
              select: { id: true, name: true, slug: true, tagline: true, logo: true }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

async function getRelatedArticles(currentSlug: string) {
  try {
    return await prisma.news.findMany({
      where: { 
        isPublished: true,
        slug: { not: currentSlug },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Extract first image from HTML content
function extractFirstImage(content: string): string | null {
  if (!content) return null;
  const imgMatch = content.match(/<img[^\u003e]+src=["']([^"']+)["'][^\u003e]*>/i);
  return imgMatch ? imgMatch[1] : null;
}

// Strip HTML tags for plain text preview
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^\u003e]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await prisma.news.findUnique({
      where: { slug, isPublished: true }
    });
    
    if (!article) {
      return { title: "Article Not Found" };
    }
    
    const firstImage = extractFirstImage(article.content);
    
    return {
      title: `${article.title} | AI News`,
      description: article.excerpt || stripHtml(article.content).substring(0, 160),
      alternates: {
        canonical: `/news/${slug}`,
      },
      openGraph: {
        title: article.title,
        description: article.excerpt || stripHtml(article.content).substring(0, 160),
        type: "article",
        publishedTime: article.publishedAt?.toISOString(),
        images: firstImage ? [firstImage] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: "AI News" };
  }
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(slug);
  const relatedTools = article.mentions?.map((m: any) => ({
    ...m.tool,
    mentions: m.mentions
  })) || [];

  // Extract image from content if no coverImage
  const contentImage = !article.coverImage ? extractFirstImage(article.content) : null;
  const displayImage = article.coverImage || contentImage;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || stripHtml(article.content).substring(0, 160),
    image: displayImage || "https://atooli.ai/news-default.jpg",
    datePublished: article.publishedAt?.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "Atooli",
      logo: {
        "@type": "ImageObject",
        url: "https://atooli.ai/logo.png",
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
            {article.source && (
              <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium rounded-full">
                {article.source}
              </span>
            )}
            <span className="text-[var(--muted)]">
              {formatDate(article.publishedAt)}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-4 leading-tight"
          >
            {article.title}
          </h1>          
          
          {article.excerpt && (
            <p className="text-xl text-[var(--muted)] leading-relaxed"
            >
              {article.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {displayImage && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-[var(--surface)]">
            <img 
              src={displayImage} 
              alt={article.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div 
              className="prose prose-lg max-w-none
                       prose-headings:text-[var(--foreground)]
                       prose-headings:font-semibold
                       prose-p:text-[var(--muted)]
                       prose-strong:text-[var(--foreground)]
                       prose-a:text-[var(--accent)]
                       prose-a:no-underline
                       prose-a:hover:underline
                       prose-img:rounded-xl
                       prose-img:my-4"
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            />
            
            {/* Source Link */}
            {article.originalUrl && (
              <div className="mt-8 pt-6 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--muted)]">
                  Source: <a 
                    href={article.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline"
                  >
                    {article.source || 'Original Article'} ↗
                  </a>
                </p>
              </div>
            )}
          </div>          
          
          <aside className="lg:col-span-1">
            <RelatedTools tools={relatedTools} />
          </aside>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-6"
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
                      {related.excerpt || stripHtml(related.content).substring(0, 100) + '...'}
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

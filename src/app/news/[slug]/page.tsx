import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";
import { marked } from "marked";

interface NewsArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatContentToHtml(content: string): string {
  if (!content) return '';
  
  marked.setOptions({
    gfm: true,
    breaks: true,
  });
  
  const html = marked.parse(content) as string;
  
  return html
    .replace(/<p>/g, '<p class="text-[var(--foreground-muted)] leading-8 mb-6">')
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-[var(--foreground)] mt-10 mb-6">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4">')
    .replace(/<h3>/g, '<h3 class="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">')
    .replace(/<h4>/g, '<h4 class="text-lg font-semibold text-[var(--foreground)] mt-5 mb-2">')
    .replace(/<ul>/g, '<ul class="list-none my-4 space-y-2 text-[var(--foreground-muted)]">')
    .replace(/<ol>/g, '<ol class="list-none my-4 space-y-2 text-[var(--foreground-muted)]">')
    .replace(/<li>/g, '<li class="pl-0">')
    .replace(/<pre><code>/g, '<pre class="bg-[var(--surface-warm)] p-4 rounded-lg overflow-x-auto my-6"><code class="text-sm font-mono text-[var(--foreground)]">')
    .replace(/<\/code><\/pre>/g, '</code></pre>')
    .replace(/<code>/g, '<code class="bg-[var(--surface-warm)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--accent)]">')
    .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-[var(--accent)] pl-4 my-6 italic text-[var(--foreground-muted)]">')
    .replace(/<img/g, '<img class="rounded-lg my-6 max-w-full"')
    .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] hover:underline" ');
}

function extractFirstImage(content: string): string | null {
  if (!content) return null;
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return imgMatch ? imgMatch[1] : null;
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
    const title = article.metaTitle || `${article.title} | AI News - Atooli`;
    const description = article.metaDescription || article.excerpt || stripHtml(article.content).substring(0, 160);
    
    return {
      title,
      description,
      alternates: {
        canonical: `/news/${slug}`,
      },
      openGraph: {
        title: article.title,
        description,
        type: "article",
        publishedTime: article.publishedAt?.toISOString(),
        images: firstImage ? [firstImage] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description,
        images: firstImage ? [firstImage] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: "AI News - Atooli" };
  }
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(slug);
  const relatedTools = article.mentions?.map((m: any) => m.tool) || [];
  const contentImage = !article.coverImage ? extractFirstImage(article.content) : null;
  const displayImage = article.coverImage || contentImage;
  const formattedContent = formatContentToHtml(article.content || '');

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
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8 pb-6 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-3 mb-4">
            {article.source && (
              <span className="text-sm text-[var(--accent)]">{article.source}</span>
            )}
            <span className="text-sm text-[var(--foreground-muted)]">
              {formatDate(article.publishedAt)}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] leading-tight">
            {article.title}
          </h1>          
        </header>

        {/* Featured Image */}
        {displayImage && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-[var(--surface-warm)]">
            <img 
              src={displayImage} 
              alt={article.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
        
        {/* Source Link */}
        {article.originalUrl && (
          <div className="mt-8 pt-6 border-t border-[var(--border-soft)]">
            <p className="text-sm text-[var(--foreground-muted)]">
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

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="mt-12 pt-8 border-t border-[var(--border-soft)]">
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Tools mentioned</h2>
            <div className="space-y-3">
              {relatedTools.map((tool: any) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group flex items-center gap-3 py-2 -mx-2 px-2 rounded-lg hover:bg-[var(--surface-warm)] transition-colors"
                >
                  <span className="text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {tool.name}
                  </span>
                  <span className="text-sm text-[var(--foreground-muted)] truncate flex-1">
                    {tool.tagline}
                  </span>
                  <svg className="w-4 h-4 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t border-[var(--border-soft)]">
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Related Articles</h2>            
            <div className="space-y-4">
              {relatedArticles.map((related) => (
                <article key={related.id}>
                  <Link 
                    href={`/news/${related.slug}`}
                    className="group block py-3 -mx-3 px-3 rounded-lg hover:bg-[var(--surface-warm)] transition-colors"
                  >
                    <div className="text-xs text-[var(--accent)] mb-1">
                      {formatDate(related.publishedAt)}
                    </div>                    
                    <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                      {related.title}
                    </h3>
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

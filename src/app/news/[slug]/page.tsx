import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";
import { ArticleSidebar, extractTableOfContents } from "@/components/ArticleSidebar";
import { marked } from "marked";

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

// Format Markdown content to HTML using marked
function formatContentToHtml(content: string): string {
  if (!content) return '';
  
  // Configure marked options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert line breaks to <br>
    headerIds: true, // Add ids to headers for TOC
  });
  
  // Parse markdown to HTML
  const html = marked.parse(content) as string;
  
  // Add Tailwind classes to rendered HTML elements
  return html
    // Style paragraphs
    .replace(/<p>/g, '<p class="text-[var(--muted)] leading-8 mb-6 text-justify" style="text-indent: 2em;">')
    // Style headings
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-[var(--foreground)] mt-10 mb-6">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4">')
    .replace(/<h3>/g, '<h3 class="text-xl font-semibold text-[var(--foreground)] mt-6 mb-3">')
    .replace(/<h4>/g, '<h4 class="text-lg font-semibold text-[var(--foreground)] mt-5 mb-2">')
    // Style lists
    .replace(/<ul>/g, '<ul class="list-disc list-inside my-4 space-y-2 text-[var(--muted)] ml-4">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside my-4 space-y-2 text-[var(--muted)] ml-4">')
    // Style code blocks
    .replace(/<pre><code>/g, '<pre class="bg-[var(--surface)] p-4 rounded-lg overflow-x-auto my-6"><code class="text-sm font-mono text-[var(--foreground)]">')
    .replace(/<\/code><\/pre>/g, '</code></pre>')
    // Style inline code
    .replace(/<code>/g, '<code class="bg-[var(--surface)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--accent)]">')
    // Style blockquotes
    .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-[var(--accent)] pl-4 my-6 italic text-[var(--muted)]">')
    // Style images
    .replace(/<img/g, '<img class="rounded-lg my-6 max-w-full"')
    // Style links (open in new tab)
    .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] hover:underline" ');
}

// Escape HTML special characters
function escapeHtml(text: string): string {
  const div: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => div[m] || m);
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
    
    // Use SEO-optimized meta fields if available
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
  const relatedTools = article.mentions?.map((m: any) => ({
    ...m.tool,
    mentions: m.mentions
  })) || [];

  // Extract table of contents from content
  const tableOfContents = extractTableOfContents(article.content || '');

  // Extract image from content if no coverImage
  const contentImage = !article.coverImage ? extractFirstImage(article.content) : null;
  const displayImage = article.coverImage || contentImage;

  // Format content with proper paragraphs
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
              className="article-content"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
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
            <ArticleSidebar 
              tools={relatedTools}
              tableOfContents={tableOfContents}
              source={article.source}
              originalUrl={article.originalUrl}
            />
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

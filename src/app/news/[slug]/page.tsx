import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StructuredData } from "@/components/StructuredData";

// 静态新闻数据（与 page.tsx 共享）
const newsArticles = [
  {
    id: "1",
    slug: "openai-gpt-5-announcement",
    title: "OpenAI Announces GPT-5: What We Know So Far",
    excerpt: "OpenAI has officially announced the development of GPT-5, promising significant improvements in reasoning, multimodal capabilities, and safety measures.",
    content: `
      <p>OpenAI has officially announced the development of GPT-5, marking another significant milestone in the evolution of large language models. The announcement, made during the company's annual developer conference, has sent ripples through the AI community.</p>
      
      <h2>Key Improvements</h2>
      
      <p>According to OpenAI, GPT-5 will feature several major improvements over its predecessor:</p>
      
      <ul>
        <li><strong>Enhanced Reasoning:</strong> The model demonstrates significantly improved logical reasoning capabilities, particularly in complex multi-step problems.</li>
        <li><strong>Multimodal Understanding:</strong> Better integration of text, image, and audio processing in a single coherent model.</li>
        <li><strong>Safety Measures:</strong> Advanced alignment techniques to reduce harmful outputs while maintaining helpfulness.</li>
      </ul>
      
      <h2>Release Timeline</h2>
      
      <p>While OpenAI hasn't provided a specific release date, industry insiders suggest we might see a preview version as early as Q3 2026. The company is currently conducting extensive safety testing with select partners.</p>
      
      <h2>What This Means for Developers</h2>
      
      <p>For developers building on OpenAI's platform, GPT-5 promises more reliable outputs and reduced need for prompt engineering. The improved reasoning capabilities could enable entirely new categories of applications.</p>
    `,
    category: "Industry",
    author: "Sarah Chen",
    authorBio: "Sarah is a senior tech journalist covering AI and machine learning for over 8 years.",
    publishedAt: "2026-02-22",
    readTime: 5,
    featured: true,
    image: "/news/gpt5.jpg",
    tags: ["OpenAI", "GPT-5", "LLM", "AI News"],
  },
  {
    id: "2",
    slug: "ai-image-generation-2025",
    title: "The State of AI Image Generation in 2025",
    excerpt: "From Midjourney to Stable Diffusion 3, we analyze the current landscape of AI image generation tools and what it means for creators.",
    content: `
      <p>AI image generation has come a long way since the early days of DALL-E and Midjourney. In 2025, we're seeing unprecedented quality and control in generated imagery.</p>
      
      <h2>The Current Leaders</h2>
      
      <p>Several tools have emerged as leaders in the space:</p>
      
      <ul>
        <li><strong>Midjourney v7:</strong> Continues to lead in artistic quality and style consistency.</li>
        <li><strong>Stable Diffusion 3:</strong> The open-source champion with impressive photorealism.</li>
        <li><strong>DALL-E 4:</strong> OpenAI's latest offers superior prompt understanding.</li>
      </ul>
      
      <h2>Impact on Creative Industries</h2>
      
      <p>The impact on creative professionals has been profound. While some feared job displacement, many artists have embraced these tools as part of their workflow, using AI for rapid prototyping and concept exploration.</p>
    `,
    category: "Analysis",
    author: "Marcus Johnson",
    authorBio: "Marcus is a digital artist and technology writer exploring the intersection of AI and creativity.",
    publishedAt: "2026-02-20",
    readTime: 8,
    featured: true,
    image: "/news/ai-image.jpg",
    tags: ["Image Generation", "Midjourney", "Stable Diffusion", "Creative AI"],
  },
  {
    id: "3",
    slug: "google-gemini-enterprise",
    title: "Google Expands Gemini for Enterprise Customers",
    excerpt: "Google announces new enterprise features for Gemini, including enhanced security, custom model training, and deeper Workspace integration.",
    content: "Full article content...",
    category: "Business",
    author: "Emily Watson",
    authorBio: "Emily covers enterprise technology and cloud computing.",
    publishedAt: "2026-02-18",
    readTime: 4,
    featured: false,
    image: "/news/gemini.jpg",
    tags: ["Google", "Gemini", "Enterprise", "Business AI"],
  },
  {
    id: "4",
    slug: "ai-coding-assistants-compared",
    title: "GitHub Copilot vs Cursor: A Developer's Guide",
    excerpt: "We compare the leading AI coding assistants to help you choose the right tool for your development workflow.",
    content: "Full article content...",
    category: "Comparison",
    author: "David Park",
    authorBio: "David is a software engineer and technical writer.",
    publishedAt: "2026-02-15",
    readTime: 10,
    featured: false,
    image: "/news/coding.jpg",
    tags: ["Coding AI", "GitHub Copilot", "Cursor", "Developer Tools"],
  },
  {
    id: "5",
    slug: "ai-regulation-eu-2025",
    title: "EU AI Act Implementation: What Companies Need to Know",
    excerpt: "The EU AI Act is now in effect. Here's how businesses need to adapt their AI strategies to remain compliant.",
    content: "Full article content...",
    category: "Regulation",
    author: "Lisa Mueller",
    authorBio: "Lisa is a legal analyst specializing in technology regulation.",
    publishedAt: "2026-02-12",
    readTime: 7,
    featured: false,
    image: "/news/regulation.jpg",
    tags: ["Regulation", "EU AI Act", "Compliance", "Policy"],
  },
  {
    id: "6",
    slug: "small-ai-models-trend",
    title: "The Rise of Small Language Models: Efficiency Meets Performance",
    excerpt: "Why developers are increasingly choosing smaller, specialized AI models over large general-purpose ones.",
    content: "Full article content...",
    category: "Technology",
    author: "Alex Kumar",
    authorBio: "Alex is a machine learning engineer and researcher.",
    publishedAt: "2026-02-10",
    readTime: 6,
    featured: false,
    image: "/news/small-models.jpg",
    tags: ["SLM", "Efficiency", "Edge AI", "Model Optimization"],
  },
];

interface NewsArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function getArticle(slug: string) {
  return newsArticles.find((a) => a.slug === slug);
}

function getRelatedArticles(currentSlug: string, category: string) {
  return newsArticles
    .filter((a) => a.slug !== currentSlug && a.category === category)
    .slice(0, 3);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  
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
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
    },
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(slug, article.category);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: `https://aitools.example.com${article.image}`,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "AI Tools Hub",
      logo: {
        "@type": "ImageObject",
        url: "https://aitools.example.com/logo.png",
      },
    },
    articleSection: article.category,
    keywords: article.tags.join(", "),
  };

  return (
    <>
      <StructuredData data={structuredData} />

      <article className="max-w-4xl mx-auto px-4 py-12"
      >
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4"
          >
            <Link
              href={`/news/category/${article.category.toLowerCase()}`}
              className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium rounded-full
                       hover:bg-[var(--accent)]/20 transition-colors"
            >
              {article.category}
            </Link>
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

        {/* Author */}
        <div className="flex items-center gap-4 py-6 mb-8 border-y border-[var(--border)]"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] rounded-full flex items-center justify-center text-white font-bold text-lg"
          >
            {article.author[0]}
          </div>
          
          <div>
            <div className="font-semibold text-[var(--foreground)]"
            >
              {article.author}
            </div>
            <div className="text-sm text-[var(--muted)]"
            >
              {article.authorBio}
            </div>
          </div>
          
          <div className="ml-auto text-sm text-[var(--muted)]"
          >
            {article.readTime} min read
          </div>
        </div>

        {/* Featured Image */}
        <div className="aspect-video bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-soft)]/20 rounded-2xl 
                        flex items-center justify-center mb-8"
        >
          <span className="text-8xl">📰</span>
        </div>

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none
                   prose-headings:font-[family-name:var(--font-display)]
                   prose-headings:text-[var(--foreground)]
                   prose-p:text-[var(--muted)]
                   prose-strong:text-[var(--foreground)]
                   prose-a:text-[var(--accent)]
                   prose-a:no-underline
                   prose-a:hover:underline
                   prose-li:text-[var(--muted)]
                   prose-ul:marker:text-[var(--accent)]"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]"
        >
          <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4"
          >
            Tags
          </h3>
          
          <div className="flex flex-wrap gap-2"
          >
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/news/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-1.5 bg-[var(--surface)] text-[var(--muted)] text-sm rounded-lg
                         border border-[var(--border)] hover:border-[var(--accent)]/50 
                         hover:text-[var(--foreground)] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mb-6"
            >
              Related Articles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {relatedArticles.map((related) => (
                <article
                  key={related.id}
                  className="group bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5
                           hover:border-[var(--accent)]/30 transition-all duration-300"
                >
                  <Link href={`/news/${related.slug}`}
                  >
                    <div className="text-xs text-[var(--accent)] font-medium uppercase tracking-wider mb-2"
                    >
                      {related.category}
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

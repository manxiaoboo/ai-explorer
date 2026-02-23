import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "AI News - Latest Updates in Artificial Intelligence",
  description: "Stay updated with the latest AI news, trends, and insights. Expert analysis on AI tools, industry developments, and emerging technologies.",
  alternates: {
    canonical: "/news",
  },
};

// 静态新闻数据
const newsArticles = [
  {
    id: "1",
    slug: "openai-gpt-5-announcement",
    title: "OpenAI Announces GPT-5: What We Know So Far",
    excerpt: "OpenAI has officially announced the development of GPT-5, promising significant improvements in reasoning, multimodal capabilities, and safety measures.",
    content: "Full article content here...",
    category: "Industry",
    author: "Sarah Chen",
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
    content: "Full article content here...",
    category: "Analysis",
    author: "Marcus Johnson",
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
    content: "Full article content here...",
    category: "Business",
    author: "Emily Watson",
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
    content: "Full article content here...",
    category: "Comparison",
    author: "David Park",
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
    content: "Full article content here...",
    category: "Regulation",
    author: "Lisa Mueller",
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
    content: "Full article content here...",
    category: "Technology",
    author: "Alex Kumar",
    publishedAt: "2026-02-10",
    readTime: 6,
    featured: false,
    image: "/news/small-models.jpg",
    tags: ["SLM", "Efficiency", "Edge AI", "Model Optimization"],
  },
];

const categories = ["All", "Industry", "Analysis", "Business", "Technology", "Regulation", "Comparison"];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NewsPage() {
  const featuredArticles = newsArticles.filter((a) => a.featured);
  const recentArticles = newsArticles.filter((a) => !a.featured);

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

        {/* Category Filter */}
        <nav className="flex flex-wrap gap-2 mb-12" aria-label="News categories">
          {categories.map((category) => (
            <Link
              key={category}
              href={category === "All" ? "/news" : `/news/category/${category.toLowerCase()}`}
              className="px-4 py-2 text-sm font-medium text-[var(--muted)] bg-[var(--surface)] 
                       border border-[var(--border)] rounded-full
                       hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 
                       transition-all duration-200
                       focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {category}
            </Link>
          ))}
        </nav>

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
                      <span className="text-6xl">📰</span>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider"
                        >
                          {article.category}
                        </span>
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
                      
                      <div className="flex items-center justify-between"
                      >
                        <span className="text-sm text-[var(--muted)]"
                        >
                          By {article.author}
                        </span>
                        <span className="text-sm text-[var(--muted)]"
                        >
                          {article.readTime} min read
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Recent Articles */}
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
                    <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider"
                    >
                      {article.category}
                    </span>
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
                  
                  <div className="flex items-center justify-between text-sm"
                  >
                    <span className="text-[var(--muted)]"
                    >
                      {article.author}
                    </span>
                    <span className="text-[var(--muted)]"
                    >
                      {article.readTime} min
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mt-16 p-8 md:p-12 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-soft)]/10 
                          rounded-2xl border border-[var(--accent)]/20 text-center"
        >
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-semibold text-[var(--foreground)] mb-4"
          >
            Stay in the Loop
          </h2>
          
          <p className="text-[var(--muted)] mb-6 max-w-xl mx-auto"
          >
            Get the latest AI news and insights delivered to your inbox. 
            No spam, unsubscribe anytime.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                aria-label="Newsletter subscription"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                       text-[var(--foreground)] placeholder-[var(--muted)]
                       focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                       transition-all"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--accent)] text-[var(--background)] rounded-lg font-semibold
                       hover:bg-[var(--accent-soft)] transition-colors
                       focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 
                       focus:ring-offset-[var(--background)]"
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

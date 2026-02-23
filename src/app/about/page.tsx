import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - AI Tools Hub",
  description: "Learn about AI Tools Hub, our mission to help you discover the best AI tools, and how we curate our directory.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <article className="prose prose-invert max-w-none">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--foreground)] mb-8"
        >
          About AI Tools Hub
        </h1>

        <p className="text-lg text-[var(--muted)] leading-relaxed mb-6"
        >
          AI Tools Hub is a curated directory of the best artificial intelligence tools 
          and software. Our mission is to help developers, creators, and businesses 
          discover the right AI tools for their specific needs.
        </p>

        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-12 mb-4"
        >
          What We Do
        </h2>

        <ul className="space-y-3 text-[var(--muted)]">
          <li>Curate and categorize AI tools across multiple domains</li>
          <li>Provide detailed information about pricing and features</li>
          <li>Track trending tools and community favorites</li>
          <li>Help users find free and open-source alternatives</li>
        </ul>

        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-12 mb-4"
        >
          Contact
        </h2>

        <p className="text-[var(--muted)]">
          Have questions or suggestions? Reach out to us at{' '}
          <a href="mailto:hello@aitools.example.com" className="text-[var(--accent)] hover:underline"
          >
            hello@aitools.example.com
          </a>
        </p>
      </article>
    </div>
  );
}

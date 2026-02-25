import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Tooli - Why We Built This",
  description: "Tooli helps you find the right AI tool without the noise. Learn about our approach to curation and why we started this.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <article className="prose prose-invert max-w-none">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--foreground)] mb-8"
        >
          About Tooli
        </h1>

        <p className="text-lg text-[var(--muted)] leading-relaxed mb-6"
        >
          There are thousands of AI tools out there. Finding the right one 
          shouldn&apos;t feel like digging through a junkyard.
        </p>

        <p className="text-lg text-[var(--muted)] leading-relaxed mb-6"
        >
          Tooli is a curated collection of the best AI tools — organized, 
          reviewed, and kept up to date. No fluff, no paid placements, 
          just honest info to help you decide.
        </p>

        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-12 mb-4"
        >
          What We Do
        </h2>

        <ul className="space-y-3 text-[var(--muted)]">
          <li>Hand-pick tools that actually solve problems</li>
          <li>Track pricing, features, and real user feedback</li>
          <li>Surface what&apos;s trending based on actual usage data</li>
          <li>Highlight free and open-source alternatives</li>
        </ul>

        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-12 mb-4"
        >
          Get in Touch
        </h2>

        <p className="text-[var(--muted)]">
          Questions, suggestions, or just want to say hi? Drop us a line at{' '}
          <a href="mailto:hello@tooli.ai" className="text-[var(--accent)] hover:underline"
          >
            hello@tooli.ai
          </a>
        </p>
      </article>
    </div>
  );
}

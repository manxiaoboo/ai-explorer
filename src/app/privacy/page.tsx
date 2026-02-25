import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy - Tooli",
  description: "How we handle your data. Short version: we collect as little as possible and don't sell it.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <article>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--foreground)] mb-8"
        >
          Privacy Policy
        </h1>

        <p className="text-[var(--muted)] mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="space-y-6 text-[var(--muted)]">
          <p>
            We collect as little data as possible. Here&apos;s what you should know.
          </p>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            What We Collect
          </h2>

          <ul className="list-disc list-inside space-y-2">
            <li>Basic usage analytics (pages visited, time on site)</li>
            <li>Your email if you submit a tool or contact us</li>
            <li>Cookies to keep you logged in (if we add accounts)</li>
          </ul>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            What We Don&apos;t Do
          </h2>

          <ul className="list-disc list-inside space-y-2">
            <li>Sell your data to anyone</li>
            <li>Track you across the web</li>
            <li>Share info with third parties (except when legally required)</li>
          </ul>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            Questions?
          </h2>

          <p>
            Email us at{' '}
            <a href="mailto:hello@tooli.ai" className="text-[var(--accent)] hover:underline">
              hello@tooli.ai
            </a>
          </p>
        </section>
      </article>
    </div>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms - Atooli",
  description: "The rules. Don't be a jerk and we'll get along fine.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <article>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--foreground)] mb-8"
        >
          Terms of Service
        </h1>

        <p className="text-[var(--muted)] mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="space-y-6 text-[var(--muted)]">
          <p>
            By using Atooli, you agree to these simple rules. Don&apos;t worry, 
            they&apos;re pretty reasonable.
          </p>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            Do&apos;s
          </h2>

          <ul className="list-disc list-inside space-y-2">
            <li>Use the site for personal or commercial purposes</li>
            <li>Share links to tools you find useful</li>
            <li>Submit accurate information about tools</li>
          </ul>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            Don&apos;ts
          </h2>

          <ul className="list-disc list-inside space-y-2">
            <li>Scrape or abuse our API</li>
            <li>Submit fake or misleading tool info</li>
            <li>Try to break things (please)</li>
          </ul>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            The Small Print
          </h2>

          <p>
            We list third-party tools but don&apos;t control them. 
            If something breaks, talk to them, not us. 
            We do our best to keep info accurate, but mistakes happen.
          </p>
        </section>
      </article>
    </div>
  );
}

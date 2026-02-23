import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - AI Tools Hub",
  description: "Terms of service for AI Tools Hub.",
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
            By accessing and using AI Tools Hub, you accept and agree to be bound by 
            these Terms of Service.
          </p>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            Use of Service
          </h2>

          <ul className="list-disc list-inside space-y-2">
            <li>You may use our directory for personal or commercial purposes</li>
            <li>You may not scrape or automate access to our content</li>
            <li>You may not submit false or misleading information</li>
          </ul>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            Disclaimer
          </h2>

          <p>
            AI Tools Hub provides information about third-party tools. We do not 
            endorse or guarantee any tool listed in our directory. Use at your own risk.
          </p>
        </section>
      </article>
    </div>
  );
}

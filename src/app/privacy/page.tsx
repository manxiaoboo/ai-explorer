import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - AI Tools Hub",
  description: "Privacy policy for AI Tools Hub. Learn how we handle your data.",
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
            At AI Tools Hub, we take your privacy seriously. This Privacy Policy describes 
            how we collect, use, and protect your personal information.
          </p>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            Information We Collect
          </h2>

          <ul className="list-disc list-inside space-y-2">
            <li>Usage data and analytics</li>
            <li>Information you provide when submitting tools</li>
            <li>Cookies and similar technologies</li>
          </ul>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--foreground)] mt-8 mb-4"
          >
            How We Use Your Information
          </h2>

          <ul className="list-disc list-inside space-y-2">
            <li>To provide and improve our services</li>
            <li>To communicate with you about submissions</li>
            <li>To analyze usage patterns and improve user experience</li>
          </ul>
        </section>
      </article>
    </div>
  );
}

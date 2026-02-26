import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Submit Your Tool - Atooli",
  description: "Add your tool to Atooli. Reach thousands of people actively searching for solutions like yours.",
};

const benefits = [
  {
    title: "Targeted exposure",
    description: "Reach people actively looking for tools like yours",
  },
  {
    title: "Permanent listing",
    description: "Once approved, your tool stays in our directory",
  },
  {
    title: "SEO value",
    description: "Quality backlink from a curated resource",
  },
  {
    title: "Free",
    description: "No cost to submit or be listed",
  },
];

export default function SubmitPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left - Value Prop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            <span>/</span>
            <span>Submit</span>
          </div>

          <h1 className="text-3xl font-medium text-[var(--foreground)] mb-4">
            List Your Tool
          </h1>
          
          <p className="text-lg text-[var(--muted)] mb-8">
            Get in front of people who are actively looking for tools like yours.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-[var(--surface)] rounded-lg p-4">
                <h3 className="font-medium text-[var(--foreground)] mb-1">{benefit.title}</h3>
                <p className="text-sm text-[var(--muted)]">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 border border-[var(--border)] rounded-lg">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
              What we look for
            </h3>
            <ul className="space-y-1.5 text-sm text-[var(--muted)]">
              <li>Working product (not just a landing page)</li>
              <li>Clear value proposition</li>
              <li>Active development or maintenance</li>
              <li>No misleading claims</li>
            </ul>
          </div>
        </div>

        {/* Right - Form */}
        <div>
          <form className="bg-[var(--surface)] rounded-lg p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Tool Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="e.g., Notion"
              />
            </div>

            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                One-line description *
              </label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                required
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="e.g., All-in-one workspace for notes, docs, and wikis"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                Keep it under 10 words. This appears in search results.
              </p>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Website URL *
              </label>
              <input
                type="url"
                id="website"
                name="website"
                required
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Select category...</option>
                  <option value="writing">Writing</option>
                  <option value="image">Image</option>
                  <option value="code">Code</option>
                  <option value="chat">Chat</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="data">Data</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="pricing" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Pricing *
                </label>
                <select
                  id="pricing"
                  name="pricing"
                  required
                  className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Select pricing...</option>
                  <option value="FREE">Free</option>
                  <option value="FREEMIUM">Freemium</option>
                  <option value="PAID">Paid</option>
                  <option value="OPEN_SOURCE">Open Source</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Full description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] resize-none"
                placeholder="Describe what your tool does, who it's for, and why people should care..."
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Your email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                placeholder="you@example.com"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                We&apos;ll use this to notify you when your listing is approved.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] font-medium rounded hover:bg-[var(--secondary)] transition-colors"
            >
              Submit for Review
            </button>

            <p className="text-xs text-[var(--muted)] text-center">
              We review all submissions within 48 hours.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

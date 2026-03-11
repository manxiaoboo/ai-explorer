"use client";

import { useState } from "react";
import Link from "next/link";

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
];

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      tagline: formData.get("tagline"),
      description: formData.get("description"),
      website: formData.get("website"),
      category: formData.get("category"),
      pricingTier: formData.get("pricing"),
      email: formData.get("email"),
    };

    try {
      const response = await fetch("/api/submit-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: result.message || "Tool submitted successfully!",
        });
        (e.target as HTMLFormElement).reset();
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to submit. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left - Value Prop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-6">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            <span>/</span>
            <span className="text-[var(--foreground)]">Submit</span>
          </div>

          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            List Your Tool
          </h1>

          <p className="text-lg text-[var(--foreground-muted)] mb-8">
            Get in front of people who are actively looking for tools like yours.
          </p>

          {/* Benefits - No cards */}
          <div className="space-y-4 mb-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <span className="text-[var(--accent)] mt-1">✓</span>
                <div>
                  <h3 className="font-medium text-[var(--foreground)]">{benefit.title}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[var(--border-soft)]">
            <h3 className="font-medium text-[var(--foreground)] mb-2">
              What we look for
            </h3>
            <ul className="space-y-1.5 text-sm text-[var(--foreground-muted)]">
              <li>• Working product (not just a landing page)</li>
              <li>• Clear value proposition</li>
              <li>• Active development or maintenance</li>
              <li>• No misleading claims</li>
            </ul>
          </div>

          <div className="mt-8 text-sm text-[var(--foreground-muted)]">
            Prefer email?{" "}
            <a
              href="mailto:billman@attooli.com?subject=Tool Submission"
              className="text-[var(--accent)] hover:underline"
            >
              billman@attooli.com
            </a>
          </div>
        </div>

        {/* Right - Form */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {submitStatus.type && (
              <div
                className={`p-4 rounded-lg ${
                  submitStatus.type === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-600"
                    : "bg-red-500/10 border border-red-500/20 text-red-600"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Tool Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                         text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="e.g., Notion"
              />
            </div>

            <div>
              <label
                htmlFor="tagline"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                One-line description *
              </label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                required
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                         text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="e.g., All-in-one workspace for notes, docs, and wikis"
              />
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Keep it under 10 words. This appears in search results.
              </p>
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Website URL *
              </label>
              <input
                type="url"
                id="website"
                name="website"
                required
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                         text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                           text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="">Select...</option>
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
                <label
                  htmlFor="pricing"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Pricing *
                </label>
                <select
                  id="pricing"
                  name="pricing"
                  required
                  className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                           text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="">Select...</option>
                  <option value="FREE">Free</option>
                  <option value="FREEMIUM">Freemium</option>
                  <option value="PAID">Paid</option>
                  <option value="OPEN_SOURCE">Open Source</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Full description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                         text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                placeholder="Describe what your tool does, who it's for, and why people should care..."
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Your email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                         text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="you@example.com"
              />
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                We&apos;ll use this to notify you when your listing is approved.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-lg 
                       hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>

            <p className="text-xs text-[var(--foreground-muted)] text-center">
              We review all submissions within 48 hours.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

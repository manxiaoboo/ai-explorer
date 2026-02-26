import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API - atooli",
  description: "Build with our data. Simple endpoints, no nonsense.",
};

export default function APIPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--foreground)] mb-4"
        >
          API
        </h1>
        <p className="text-lg text-[var(--muted)]">
          Build with our data. RESTful, simple, no API keys needed (for now).
        </p>
      </header>

      <div className="bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border)]"
      >
        <h2 className="font-semibold text-[var(--foreground)] mb-4">
          API Endpoints
        </h2>

        <div className="space-y-4 font-[family-name:var(--font-mono)] text-sm"
        >
          <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]"
          >
            <span className="text-[var(--accent)]">GET</span>{' '}
            <span className="text-[var(--foreground)]">/api/tools</span>
            <p className="text-[var(--muted)] mt-2 font-[family-name:var(--font-body)]">
              Get all tools, paginated
            </p>
          </div>

          <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]"
          >
            <span className="text-[var(--accent)]">GET</span>{' '}
            <span className="text-[var(--foreground)]">/api/tools/:slug</span>
            <p className="text-[var(--muted)] mt-2 font-[family-name:var(--font-body)]">
              Get a single tool by slug
            </p>
          </div>

          <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]"
          >
            <span className="text-[var(--accent)]">GET</span>{' '}
            <span className="text-[var(--foreground)]">/api/categories</span>
            <p className="text-[var(--muted)] mt-2 font-[family-name:var(--font-body)]">
              Get all categories
            </p>
          </div>
        </div>

        <p className="mt-6 text-[var(--muted)]"
        >
          Need higher limits or have questions? Email{' '}
          <a href="mailto:hello@tooli.ai" className="text-[var(--accent)] hover:underline"
          >
            hello@tooli.ai
          </a>
        </p>
      </div>
    </div>
  );
}

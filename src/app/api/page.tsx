import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API - AI Tools Hub",
  description: "Access our API to programmatically retrieve AI tool data.",
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
          Access our data programmatically. Coming soon.
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
              List all tools
            </p>
          </div>

          <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]"
          >
            <span className="text-[var(--accent)]">GET</span>{' '}
            <span className="text-[var(--foreground)]">/api/tools/:slug</span>
            <p className="text-[var(--muted)] mt-2 font-[family-name:var(--font-body)]">
              Get a specific tool
            </p>
          </div>

          <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]"
          >
            <span className="text-[var(--accent)]">GET</span>{' '}
            <span className="text-[var(--foreground)]">/api/categories</span>
            <p className="text-[var(--muted)] mt-2 font-[family-name:var(--font-body)]">
              List all categories
            </p>
          </div>
        </div>

        <p className="mt-6 text-[var(--muted)]"
        >
          Contact us for API access:{' '}
          <a href="mailto:api@aitools.example.com" className="text-[var(--accent)] hover:underline"
          >
            api@aitools.example.com
          </a>
        </p>
      </div>
    </div>
  );
}

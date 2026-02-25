import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Your Tool - Get Listed on Tooli",
  description: "Add your AI tool to Tooli. Reach thousands of people actively searching for solutions like yours.",
};

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <header className="text-center mb-12">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--foreground)] mb-4"
        >
          List Your Tool
        </h1>
        <p className="text-lg text-[var(--muted)]">
          Get in front of people who are actively looking for tools like yours.
        </p>
      </header>

      <form className="space-y-6 bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border)]"
            aria-label="Submit tool form"
      >
        <div>
          <label htmlFor="toolName" className="block text-sm font-medium text-[var(--foreground)] mb-2"
          >
            Tool Name *
          </label>
          <input
            type="text"
            id="toolName"
            name="toolName"
            required
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                     text-[var(--foreground)] placeholder-[var(--muted)]
                     focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                     transition-all"
            placeholder="e.g., ChatGPT"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-[var(--foreground)] mb-2"
          >
            Website URL *
          </label>
          <input
            type="url"
            id="website"
            name="website"
            required
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                     text-[var(--foreground)] placeholder-[var(--muted)]
                     focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                     transition-all"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)] mb-2"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                     text-[var(--foreground)] placeholder-[var(--muted)]
                     focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                     transition-all resize-none"
            placeholder="Briefly describe what your tool does..."
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-2"
          >
            Contact Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg 
                     text-[var(--foreground)] placeholder-[var(--muted)]
                     focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
                     transition-all"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[var(--accent)] text-[var(--background)] rounded-lg font-semibold
                   hover:bg-[var(--accent-soft)] transition-colors
                   focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 
                   focus:ring-offset-[var(--surface)]"
        >
          Submit Tool
        </button>
      </form>
    </div>
  );
}

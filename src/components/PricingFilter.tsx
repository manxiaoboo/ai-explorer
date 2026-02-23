"use client";

import Link from "next/link";

const pricingOptions = [
  { value: "FREE", label: "Free", count: 120, class: "text-emerald-400" },
  { value: "FREEMIUM", label: "Freemium", count: 85, class: "text-amber-400" },
  { value: "PAID", label: "Paid", count: 200, class: "text-rose-400" },
  { value: "OPEN_SOURCE", label: "Open Source", count: 45, class: "text-sky-400" },
];

export function PricingFilter() {
  return (
    <nav 
      className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5"
      aria-label="Pricing filter"
    >
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground)] mb-4"
      >
        Pricing
      </h3>
      
      <ul className="space-y-1">
        <li>
          <Link
            href="/free-ai-tools"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg 
                     bg-[var(--accent)]/10 text-[var(--accent)] font-medium
                     hover:bg-[var(--accent)]/20 transition-all duration-200
                     focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
            aria-label="Browse free tools"
          >
            <span>Free Tools</span>
            <span className="text-xs bg-[var(--accent)]/20 px-2 py-0.5 rounded-full tabular-nums"
            >
              120
            </span>
          </Link>
        </li>
        {pricingOptions.slice(1).map((option) => (
          <li key={option.value}>
            <span
              className="flex items-center justify-between px-3 py-2.5 rounded-lg 
                       text-[var(--muted)] cursor-default"
              aria-label={`${option.label} tools - filter coming soon`}
            >
              <span className={option.class}>{option.label}</span>
              <span className="text-xs text-[var(--muted)] tabular-nums">{option.count}</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

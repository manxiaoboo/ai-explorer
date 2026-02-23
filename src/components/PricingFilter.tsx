"use client";

import Link from "next/link";

const pricingOptions = [
  { value: "FREE", label: "Free", count: 120 },
  { value: "FREEMIUM", label: "Freemium", count: 85 },
  { value: "PAID", label: "Paid", count: 200 },
  { value: "OPEN_SOURCE", label: "Open Source", count: 45 },
];

export function PricingFilter() {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
      <nav className="space-y-1">
        <Link
          href="/free-ai-tools"
          className="flex items-center justify-between px-3 py-2 rounded-md text-sm bg-green-50 text-green-700 font-medium"
        >
          <span>🆓 Free Tools</span>
          <span className="text-xs bg-green-200 px-2 py-0.5 rounded-full">120</span>
        </Link>
        {pricingOptions.slice(1).map((option) => (
          <Link
            key={option.value}
            href={`/pricing/${option.value.toLowerCase()}`}
            className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <span>{option.label}</span>
            <span className="text-xs text-gray-400">{option.count}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

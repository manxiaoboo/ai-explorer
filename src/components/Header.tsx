"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/tools", label: "Tools" },
    { href: "/news", label: "News" },
    { href: "/free-ai-tools", label: "Free" },
    { href: "/trending", label: "Trending" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            aria-label="Tooli - Home"
          >
            <div className="w-7 h-7 bg-[var(--foreground)] rounded flex items-center justify-center text-[var(--background)] font-bold text-sm">
              T
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Tooli
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] rounded-md
                         hover:bg-[var(--surface)] transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Submit Tool Button */}
          <Link
            href="/submit"
            className="hidden md:inline-flex px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-md hover:bg-[var(--secondary)] transition-colors"
          >
            Submit
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-[var(--border)]">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

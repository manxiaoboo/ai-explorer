"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/tools", label: "Tools" },
    { href: "/news", label: "News" },
    { href: "/free-ai-tools", label: "Free" },
    { href: "/trending", label: "Trending" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border-soft)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] rounded-full
                         hover:bg-[var(--accent-muted)] transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Submit Tool Button */}
          <Link
            href="/submit"
            className="hidden md:inline-flex px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-medium 
                     rounded-full hover:bg-[var(--accent-hover)] transition-all duration-200
                     shadow-lg shadow-[var(--accent)]/20 hover:shadow-xl hover:shadow-[var(--accent)]/30
                     hover:-translate-y-0.5"
          >
            Submit Tool
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2.5 text-[var(--foreground-muted)] hover:text-[var(--accent)] 
                     hover:bg-[var(--accent-muted)] rounded-full transition-colors"
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
          <nav className="md:hidden py-4 border-t border-[var(--border-soft)]">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-[var(--foreground-muted)] hover:text-[var(--accent)] 
                             hover:bg-[var(--accent-muted)] rounded-xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/submit"
                  className="block px-4 py-3 text-center bg-[var(--accent)] text-white font-medium 
                           rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Submit Tool
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

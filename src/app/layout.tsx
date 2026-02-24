import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aitools.example.com"),
  title: {
    default: "AI Tools Hub — Discover the Best AI Tools",
    template: "%s | AI Tools Hub",
  },
  description: "Browse 500+ AI tools with pricing, reviews, and trending scores. Find free AI tools, compare features, and discover the best AI software.",
  keywords: ["AI tools", "artificial intelligence", "AI software", "machine learning tools", "AI apps"],
  authors: [{ name: "AI Tools Hub" }],
  creator: "AI Tools Hub",
  publisher: "AI Tools Hub",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aitools.example.com",
    siteName: "AI Tools Hub",
    title: "AI Tools Hub — Discover the Best AI Tools",
    description: "Browse 500+ AI tools with pricing, reviews, and trending scores.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Hub — Discover the Best AI Tools",
    description: "Browse 500+ AI tools with pricing, reviews, and trending scores.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <meta name="theme-color" content="#0a0a0c" />
      </head>
      <body className="min-h-screen antialiased flex flex-col">
        <a 
          href="#main-content" 
          className="fixed top-4 left-4 z-[100] px-4 py-2 bg-orange-500 text-white font-medium rounded-lg shadow-lg transform -translate-y-20 focus:translate-y-0 transition-transform duration-200"
        >
          Skip to main content
        </a>
        <Header />
        
        <main id="main-content" className="flex-1">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}

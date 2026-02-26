import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://tooli.ai"),
  title: {
    default: "Atooli — Find the Perfect AI Tool",
    template: "%s | Atooli",
  },
  description: "Discover 500+ AI tools with reviews, pricing, and trending scores. Find free AI tools, compare features, and find the perfect tool for your workflow.",
  keywords: ["AI tools", "artificial intelligence", "AI software", "machine learning tools", "AI apps", "Atooli"],
  authors: [{ name: "Atooli" }],
  creator: "Atooli",
  publisher: "Atooli",
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
    url: "https://tooli.ai",
    siteName: "Atooli",
    title: "Atooli — Find the Perfect AI Tool",
    description: "Discover 500+ AI tools with reviews, pricing, and trending scores.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atooli — Find the Perfect AI Tool",
    description: "Discover 500+ AI tools with reviews, pricing, and trending scores.",
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
    <html lang="en">
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

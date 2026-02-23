import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://aitools.example.com"),
  title: {
    default: "AI Tools Hub - Discover the Best AI Tools",
    template: "%s | AI Tools Hub",
  },
  description: "Discover, compare, and find the best AI tools for your needs. Browse 500+ AI tools with pricing, reviews, and trending scores.",
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
    title: "AI Tools Hub - Discover the Best AI Tools",
    description: "Discover, compare, and find the best AI tools for your needs.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Tools Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Hub - Discover the Best AI Tools",
    description: "Discover, compare, and find the best AI tools for your needs.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
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
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

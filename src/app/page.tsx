import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tools Hub - Discover the Best AI Tools",
  description: "Discover, compare, and find the best AI tools for your needs.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          AI Tools Hub
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-8">
          Discover the best AI tools. Coming soon.
        </p>
      </div>
    </div>
  );
}

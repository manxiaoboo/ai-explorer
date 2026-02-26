import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { NewsStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Admin Dashboard - Atooli",
};

async function getStats() {
  const [toolsCount, categoriesCount, tagsCount, newsCount, pendingCount] = await Promise.all([
    prisma.tool.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.news.count(),
    prisma.news.count({ where: { status: { in: [NewsStatus.PENDING, NewsStatus.REVIEWED] } } })
  ]);
  
  return { toolsCount, categoriesCount, tagsCount, newsCount, pendingCount };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Site
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Pending Review Alert */}
        {stats.pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📬</span>
              <div>
                <div className="font-medium text-amber-900">{stats.pendingCount} articles waiting for review</div>
                <div className="text-sm text-amber-700">AI-curated articles ready for your approval</div>
              </div>
            </div>
            <Link
              href="/admin/news/review"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Review Now →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-blue-600">{stats.toolsCount}</div>
            <div className="text-gray-600 mt-1">AI Tools</div>
            <Link href="/admin/tools" className="text-sm text-blue-600 mt-4 inline-block hover:underline">
              Manage Tools →
            </Link>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-green-600">{stats.categoriesCount}</div>
            <div className="text-gray-600 mt-1">Categories</div>
            <Link href="/admin/categories" className="text-sm text-green-600 mt-4 inline-block hover:underline">
              Manage Categories →
            </Link>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-purple-600">{stats.tagsCount}</div>
            <div className="text-gray-600 mt-1">Tags</div>
            <div className="text-sm text-gray-400 mt-4">Managed via Tools</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-orange-600">{stats.newsCount}</div>
            <div className="text-gray-600 mt-1">News Articles</div>
            <Link href="/admin/news" className="text-sm text-orange-600 mt-4 inline-block hover:underline">
              Manage News →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/tools/new"
              className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl">➕</span>
              <div>
                <div className="font-medium">Add New Tool</div>
                <div className="text-sm text-gray-500">Create a new AI tool entry</div>
              </div>
            </Link>
            <Link
              href="/admin/categories/new"
              className="flex items-center gap-3 p-4 rounded-lg border hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl">📁</span>
              <div>
                <div className="font-medium">Add New Category</div>
                <div className="text-sm text-gray-500">Create a new category</div>
              </div>
            </Link>
            <Link
              href="/admin/news/new"
              className="flex items-center gap-3 p-4 rounded-lg border hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <span className="text-2xl">📰</span>
              <div>
                <div className="font-medium">Add News Article</div>
                <div className="text-sm text-gray-500">Create a new blog post</div>
              </div>
            </Link>
            <Link
              href="/admin/news/review"
              className="flex items-center gap-3 p-4 rounded-lg border hover:border-amber-500 hover:bg-amber-50 transition-colors"
            >
              <span className="text-2xl">📬</span>
              <div>
                <div className="font-medium">Review Pending News</div>
                <div className="text-sm text-gray-500">
                  {stats.pendingCount > 0 ? `${stats.pendingCount} articles waiting` : 'No pending articles'}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

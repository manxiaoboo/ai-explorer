import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin Dashboard - AI Tools Hub",
};

async function getStats() {
  const [toolsCount, categoriesCount, tagsCount] = await Promise.all([
    prisma.tool.count(),
    prisma.category.count(),
    prisma.tag.count(),
  ]);
  return { toolsCount, categoriesCount, tagsCount };
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          </div>
        </div>
      </main>
    </div>
  );
}

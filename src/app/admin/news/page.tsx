import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DeleteNewsButton } from "./DeleteNewsButton";
import { NewsStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Manage News - Admin",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getNews() {
  return prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function getPendingCount(): Promise<number> {
  return prisma.news.count({
    where: { status: { in: [NewsStatus.PENDING, NewsStatus.REVIEWED] } }
  });
}

export default async function NewsPage() {
  const [news, pendingCount] = await Promise.all([
    getNews(),
    getPendingCount()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold">Manage News</h1>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <Link
                href="/admin/news/review"
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 flex items-center gap-2"
              >
                <span>🔔</span>
                <span>{pendingCount} Pending Review</span>
              </Link>
            )}
            <Link
              href="/admin/news/new"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + Add News
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Review Alert */}
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📬</span>
              <div>
                <div className="font-medium text-amber-900">{pendingCount} articles waiting for review</div>
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

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Source</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{item.excerpt}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.source || 'Manual'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.publishedAt 
                      ? new Date(item.publishedAt).toLocaleDateString() 
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/news/${item.slug}`}
                        target="_blank"
                        className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/news/${item.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1"
                      >
                        Edit
                      </Link>
                      <DeleteNewsButton newsId={item.id} newsTitle={item.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DeleteNewsButton } from "./DeleteNewsButton";

export const metadata: Metadata = {
  title: "Manage News - Admin",
};

async function getNews() {
  return prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function NewsPage() {
  const news = await getNews();

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
          <Link
            href="/admin/news/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + Add News
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Slug</th>
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
                  <td className="px-6 py-4 text-sm text-gray-600">{item.slug}</td>
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

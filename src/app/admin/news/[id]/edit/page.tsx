import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateNews } from "../../actions";

interface EditNewsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getNews(id: string) {
  return prisma.news.findUnique({
    where: { id },
  });
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = await params;
  const news = await getNews(id);

  if (!news) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/news" className="text-gray-600 hover:text-gray-900">
            ← Back to News
          </Link>
          <h1 className="text-xl font-bold">Edit Article: {news.title}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form action={updateNews} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <input type="hidden" name="id" value={news.id} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                required
                defaultValue={news.title}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                name="slug"
                required
                defaultValue={news.slug}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label>
            <textarea
              name="excerpt"
              required
              rows={2}
              defaultValue={news.excerpt}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              name="content"
              required
              rows={10}
              defaultValue={news.content}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              name="coverImage"
              defaultValue={news.coverImage || ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                defaultValue={news.metaTitle || ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <input
                type="text"
                name="metaDescription"
                defaultValue={news.metaDescription || ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              name="isPublished" 
              id="isPublished" 
              defaultChecked={news.isPublished}
              className="w-4 h-4" 
            />
            <label htmlFor="isPublished" className="text-sm">Published</label>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/admin/news"
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 text-black"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

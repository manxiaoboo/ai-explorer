import { Metadata } from "next";
import Link from "next/link";
import { createNews } from "./actions";

export const metadata: Metadata = {
  title: "Add News - Admin",
};

export default function NewNewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/news" className="text-gray-600 hover:text-gray-900">
            ← Back to News
          </Link>
          <h1 className="text-xl font-bold">Add News Article</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form action={createNews} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                placeholder="Article title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                name="slug"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                placeholder="article-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label>
            <textarea
              name="excerpt"
              required
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              placeholder="Short summary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              name="content"
              required
              rows={10}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black font-mono"
              placeholder="Article content (Markdown supported)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              name="coverImage"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                placeholder="SEO title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <input
                type="text"
                name="metaDescription"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                placeholder="SEO description"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="isPublished" id="isPublished" className="w-4 h-4" />
            <label htmlFor="isPublished" className="text-sm">Publish immediately</label>
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
              Create Article
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

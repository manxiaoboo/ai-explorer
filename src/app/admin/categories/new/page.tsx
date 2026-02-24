import { Metadata } from "next";
import Link from "next/link";
import { createCategory } from "./actions";

export const metadata: Metadata = {
  title: "Add New Category - Admin",
};

export default function NewCategoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/categories" className="text-gray-600 hover:text-gray-900">
            ← Back to Categories
          </Link>
          <h1 className="text-xl font-bold">Add New Category</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form action={createCategory} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., AI Writing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                name="slug"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., ai-writing"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              required
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Category description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
              <input
                type="text"
                name="icon"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., ✍️"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                name="sortOrder"
                defaultValue="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/admin/categories"
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Category
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

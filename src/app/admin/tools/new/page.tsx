import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { createTool } from "../actions";

export const metadata: Metadata = {
  title: "Add New Tool - Admin",
};

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function NewToolPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/tools" className="text-gray-600 hover:text-gray-900">
            ← Back to Tools
          </Link>
          <h1 className="text-xl font-bold">Add New Tool</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form action={createTool} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ChatGPT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                name="slug"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., chatgpt"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline *</label>
            <input
              type="text"
              name="tagline"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Short description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL *</label>
            <input
              type="url"
              name="website"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="categoryId"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Tier *</label>
              <select
                name="pricingTier"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="FREE">Free</option>
                <option value="FREEMIUM">Freemium</option>
                <option value="PAID">Paid</option>
                <option value="ENTERPRISE">Enterprise</option>
                <option value="OPEN_SOURCE">Open Source</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price ($)</label>
              <input
                type="number"
                name="priceStart"
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Stars</label>
              <input
                type="number"
                name="githubStars"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Hunt Votes</label>
              <input
                type="number"
                name="productHuntVotes"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 5000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trending Score (0-100)</label>
            <input
              type="number"
              name="trendingScore"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
            <textarea
              name="features"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Use Cases (one per line)</label>
            <textarea
              name="useCases"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Use case 1&#10;Use case 2&#10;Use case 3"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="hasFreeTier" className="w-4 h-4" />
              <span className="text-sm">Has Free Tier</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="hasTrial" className="w-4 h-4" />
              <span className="text-sm">Has Free Trial</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isFeatured" className="w-4 h-4" />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/admin/tools"
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Tool
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

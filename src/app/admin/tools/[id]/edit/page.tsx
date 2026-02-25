import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateTool } from "../../actions";

interface EditToolPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTool(id: string) {
  return prisma.tool.findUnique({
    where: { id },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function EditToolPage({ params }: EditToolPageProps) {
  const { id } = await params;
  const [tool, categories] = await Promise.all([
    getTool(id),
    getCategories(),
  ]);

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/tools" className="text-gray-600 hover:text-gray-900">
            ← Back to Tools
          </Link>
          <h1 className="text-xl font-bold">Edit Tool: {tool.name}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form action={updateTool} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <input type="hidden" name="id" value={tool.id} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={tool.name}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                name="slug"
                required
                defaultValue={tool.slug}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline *</label>
            <input
              type="text"
              name="tagline"
              required
              defaultValue={tool.tagline}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={tool.description}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL *</label>
            <input
              type="url"
              name="website"
              required
              defaultValue={tool.website}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              name="logo"
              defaultValue={tool.logo || ""}
              placeholder="https://example.com/logo.png or data:image/svg+xml,..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from tool name</p>
            {tool.logo && (
              <div className="mt-2">
                <img src={tool.logo} alt="Current logo" className="w-12 h-12 rounded-lg object-cover border" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="categoryId"
                required
                defaultValue={tool.categoryId}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
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
                defaultValue={tool.pricingTier}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
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
                defaultValue={tool.priceStart || ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Stars</label>
              <input
                type="number"
                name="githubStars"
                defaultValue={tool.githubStars || ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Hunt Votes</label>
              <input
                type="number"
                name="productHuntVotes"
                defaultValue={tool.productHuntVotes || ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
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
              defaultValue={tool.trendingScore}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
            <textarea
              name="features"
              rows={3}
              defaultValue={tool.features.join("\n")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Use Cases (one per line)</label>
            <textarea
              name="useCases"
              rows={3}
              defaultValue={tool.useCases.join("\n")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="hasFreeTier" defaultChecked={tool.hasFreeTier} className="w-4 h-4" />
              <span className="text-sm">Has Free Tier</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="hasTrial" defaultChecked={tool.hasTrial} className="w-4 h-4" />
              <span className="text-sm">Has Free Trial</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isFeatured" defaultChecked={tool.isFeatured} className="w-4 h-4" />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked={tool.isActive} className="w-4 h-4" />
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
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

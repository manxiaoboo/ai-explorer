import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteTool } from "./actions";

export const metadata: Metadata = {
  title: "Manage Tools - Admin",
};

async function getTools() {
  return prisma.tool.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold">Manage Tools</h1>
          </div>
          <Link
            href="/admin/tools/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Tool
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tool</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Pricing</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {tool.name[0]}
                      </div>
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{tool.tagline}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{tool.category.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      tool.pricingTier === 'FREE' ? 'bg-green-100 text-green-800' :
                      tool.pricingTier === 'FREEMIUM' ? 'bg-amber-100 text-amber-800' :
                      tool.pricingTier === 'OPEN_SOURCE' ? 'bg-sky-100 text-sky-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {tool.pricingTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      tool.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tool.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {tool.isFeatured && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/tools/${tool.slug}`}
                        target="_blank"
                        className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/tools/${tool.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1"
                      >
                        Edit
                      </Link>
                      <form action={deleteTool}>
                        <input type="hidden" name="id" value={tool.id} />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-800 px-3 py-1"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to delete this tool?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </form>
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

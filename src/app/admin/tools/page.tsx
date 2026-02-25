import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DeleteToolButton } from "./DeleteToolButton";
import { FeaturedToggle } from "./FeaturedToggle";
import { ToolLogo } from "@/components/ToolLogo";

export const metadata: Metadata = {
  title: "Manage Tools - Admin",
};

async function getTools() {
  return prisma.tool.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getFeaturedCount() {
  return prisma.tool.count({
    where: { isFeatured: true, isActive: true },
  });
}

export default async function ToolsPage() {
  const [tools, featuredCount] = await Promise.all([
    getTools(),
    getFeaturedCount(),
  ]);

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
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Featured: {featuredCount}/5
            </span>
            <Link
              href="/admin/tools/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Tool
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tool</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Featured</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ToolLogo name={tool.name} logo={tool.logo} size="sm" />
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{tool.tagline}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{tool.category.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      tool.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tool.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeaturedToggle
                      toolId={tool.id}
                      toolName={tool.name}
                      isFeatured={tool.isFeatured}
                      featuredCount={featuredCount}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/tools/${tool.slug}`}
                        target="_blank"
                        className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/tools/${tool.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1"
                      >
                        Edit
                      </Link>
                      <DeleteToolButton toolId={tool.id} toolName={tool.name} />
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

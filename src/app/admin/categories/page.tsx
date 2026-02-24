import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteCategory } from "./actions";

export const metadata: Metadata = {
  title: "Manage Categories - Admin",
};

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { tools: true },
      },
    },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold">Manage Categories</h1>
          </div>
          <Link
            href="/admin/categories/new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Category
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Slug</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Tools</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon || "📁"}</span>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-1 text-sm bg-gray-100 rounded-full">
                      {category._count.tools}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/category/${category.slug}`}
                        target="_blank"
                        className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1"
                      >
                        Edit
                      </Link>
                      {category._count.tools === 0 && (
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={category.id} />
                          <button
                            type="submit"
                            className="text-sm text-red-600 hover:text-red-800 px-3 py-1"
                            onClick={(e) => {
                              if (!confirm("Are you sure?")) {
                                e.preventDefault();
                              }
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      )}
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

"use client";

import { deleteCategory } from "./actions";

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryButton({ categoryId, categoryName }: DeleteCategoryButtonProps) {
  return (
    <form action={deleteCategory}>
      <input type="hidden" name="id" value={categoryId} />
      <button
        type="submit"
        className="text-sm text-red-600 hover:text-red-800 px-3 py-1"
        onClick={(e) => {
          if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}

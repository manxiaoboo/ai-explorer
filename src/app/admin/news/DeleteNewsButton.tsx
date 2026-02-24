"use client";

import { deleteNews } from "./actions";

interface DeleteNewsButtonProps {
  newsId: string;
  newsTitle: string;
}

export function DeleteNewsButton({ newsId, newsTitle }: DeleteNewsButtonProps) {
  return (
    <form action={deleteNews}>
      <input type="hidden" name="id" value={newsId} />
      <button
        type="submit"
        className="text-sm text-red-600 hover:text-red-800 px-3 py-1"
        onClick={(e) => {
          if (!confirm(`Are you sure you want to delete "${newsTitle}"?`)) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}

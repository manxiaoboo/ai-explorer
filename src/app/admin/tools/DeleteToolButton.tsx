"use client";

import { deleteTool } from "./actions";

interface DeleteToolButtonProps {
  toolId: string;
  toolName: string;
}

export function DeleteToolButton({ toolId, toolName }: DeleteToolButtonProps) {
  return (
    <form action={deleteTool}>
      <input type="hidden" name="id" value={toolId} />
      <button
        type="submit"
        className="text-sm text-red-600 hover:text-red-800 px-3 py-1"
        onClick={(e) => {
          if (!confirm(`Are you sure you want to delete "${toolName}"?`)) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}

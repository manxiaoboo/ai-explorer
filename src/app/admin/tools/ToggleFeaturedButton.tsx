"use client";

import { toggleFeatured } from "./featured-actions";

interface ToggleFeaturedButtonProps {
  toolId: string;
  isFeatured: boolean;
  toolName: string;
}

export function ToggleFeaturedButton({ toolId, isFeatured, toolName }: ToggleFeaturedButtonProps) {
  return (
    <form action={toggleFeatured} className="inline">
      <input type="hidden" name="id" value={toolId} />
      <input type="hidden" name="currentStatus" value={isFeatured.toString()} />
      <button
        type="submit"
        className={`text-sm px-3 py-1 rounded transition-colors ${
          isFeatured
            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        title={isFeatured ? "Remove from featured" : "Add to featured"}
      >
        {isFeatured ? "★ Featured" : "☆ Feature"}
      </button>
    </form>
  );
}

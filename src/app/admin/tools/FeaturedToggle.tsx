"use client";

import { useState } from "react";
import { toggleFeatured } from "./featured-actions";

interface FeaturedToggleProps {
  toolId: string;
  toolName: string;
  isFeatured: boolean;
  featuredCount: number;
}

export function FeaturedToggle({ toolId, toolName, isFeatured, featuredCount }: FeaturedToggleProps) {
  const [isPending, setIsPending] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(isFeatured);

  const handleToggle = async () => {
    if (!currentStatus && featuredCount >= 5) {
      alert("Maximum 5 featured tools allowed. Please unfeature another tool first.");
      return;
    }

    setIsPending(true);
    const formData = new FormData();
    formData.append("id", toolId);
    formData.append("currentStatus", String(currentStatus));
    
    await toggleFeatured(formData);
    setCurrentStatus(!currentStatus);
    setIsPending(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
        currentStatus
          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
      title={currentStatus ? "Click to unfeature" : "Click to feature (max 5)"}
    >
      {isPending ? (
        "..."
      ) : (
        <>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {currentStatus ? "Featured" : "Feature"}
        </>
      )}
    </button>
  );
}

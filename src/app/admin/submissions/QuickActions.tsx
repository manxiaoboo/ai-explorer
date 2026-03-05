"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  submissionId: string;
  currentStatus: string;
}

export function QuickActions({ submissionId, currentStatus }: QuickActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(status: string) {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setIsLoading(false);
    }
  }

  const actions = [
    { status: "REVIEWED", label: "Mark Reviewed", color: "bg-blue-500 hover:bg-blue-600" },
    { status: "APPROVED", label: "Approve", color: "bg-emerald-500 hover:bg-emerald-600" },
    { status: "REJECTED", label: "Reject", color: "bg-red-500 hover:bg-red-600" },
  ];

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => (
        <button
          key={action.status}
          onClick={() => updateStatus(action.status)}
          disabled={isLoading || currentStatus === action.status}
          className={`px-3 py-1.5 text-xs font-medium text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
        >
          {isLoading ? "..." : action.label}
        </button>
      ))}
    </div>
  );
}

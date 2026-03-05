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

  // 根据当前状态显示可用的操作
  const getAvailableActions = (status: string) => {
    switch (status) {
      case "PENDING":
        return [
          { status: "REVIEWED", label: "Mark Reviewed", color: "bg-blue-500 hover:bg-blue-600" },
          { status: "APPROVED", label: "Approve", color: "bg-emerald-500 hover:bg-emerald-600" },
          { status: "REJECTED", label: "Reject", color: "bg-red-500 hover:bg-red-600" },
        ];
      case "REVIEWED":
        return [
          { status: "APPROVED", label: "Approve", color: "bg-emerald-500 hover:bg-emerald-600" },
          { status: "REJECTED", label: "Reject", color: "bg-red-500 hover:bg-red-600" },
        ];
      case "APPROVED":
      case "REJECTED":
        return [
          { status: "PENDING", label: "Reopen", color: "bg-amber-500 hover:bg-amber-600" },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions(currentStatus);

  // 如果当前状态是终态，显示状态标签
  if (currentStatus === "APPROVED" || currentStatus === "REJECTED") {
    return (
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1.5 text-xs font-medium rounded ${
          currentStatus === "APPROVED" 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {currentStatus}
        </span>
        {actions.map((action) => (
          <button
            key={action.status}
            onClick={() => updateStatus(action.status)}
            disabled={isLoading}
            className={`px-3 py-1.5 text-xs font-medium text-white rounded transition-colors disabled:opacity-50 ${action.color}`}
          >
            {isLoading ? "..." : action.label}
          </button>
        ))}
      </div>
    );
  }

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

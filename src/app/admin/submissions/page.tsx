import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ToolSubmissionStatus } from "@prisma/client";
import { QuickActions } from "./QuickActions";

export const metadata: Metadata = {
  title: "Tool Submissions - Admin",
};

export const dynamic = "force-dynamic";

async function getSubmissions(status?: ToolSubmissionStatus) {
  return prisma.toolSubmission.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

async function getSubmissionStats() {
  const [pending, reviewed, approved, rejected, total] = await Promise.all([
    prisma.toolSubmission.count({ where: { status: "PENDING" } }),
    prisma.toolSubmission.count({ where: { status: "REVIEWED" } }),
    prisma.toolSubmission.count({ where: { status: "APPROVED" } }),
    prisma.toolSubmission.count({ where: { status: "REJECTED" } }),
    prisma.toolSubmission.count(),
  ]);
  return { pending, reviewed, approved, rejected, total };
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPricingTier(tier: string) {
  return tier
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

interface SubmissionsPageProps {
  searchParams: Promise<{ status?: ToolSubmissionStatus }>;
}

export default async function SubmissionsPage({
  searchParams,
}: SubmissionsPageProps) {
  const params = await searchParams;
  const currentStatus = params.status;
  const [submissions, stats] = await Promise.all([
    getSubmissions(currentStatus),
    getSubmissionStats(),
  ]);

  const statusTabs = [
    { key: undefined, label: "All", count: stats.total },
    { key: "PENDING" as const, label: "Pending", count: stats.pending },
    { key: "REVIEWED" as const, label: "Reviewed", count: stats.reviewed },
    { key: "APPROVED" as const, label: "Approved", count: stats.approved },
    { key: "REJECTED" as const, label: "Rejected", count: stats.rejected },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold">Tool Submissions</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statusTabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.key ? `/admin/submissions?status=${tab.key}` : "/admin/submissions"}
              className={`p-4 rounded-lg border transition-colors ${
                currentStatus === tab.key ||
                (!currentStatus && tab.key === undefined)
                  ? "bg-purple-50 border-purple-200"
                  : "bg-white border-gray-200 hover:border-purple-200"
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{tab.count}</div>
              <div className="text-sm text-gray-600">{tab.label}</div>
            </Link>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusTabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.key ? `/admin/submissions?status=${tab.key}` : "/admin/submissions"}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStatus === tab.key ||
                (!currentStatus && tab.key === undefined)
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Submissions Table */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No submissions found
            </h3>
            <p className="text-gray-600">
              {currentStatus
                ? `No ${currentStatus.toLowerCase()} submissions yet.`
                : "No tool submissions yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Tool
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Pricing
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{submission.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {submission.tagline}
                        </div>
                        <a
                          href={submission.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-600 hover:underline"
                        >
                          Visit Website ↗
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                          {submission.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            submission.pricingTier === "FREE"
                              ? "bg-emerald-100 text-emerald-700"
                              : submission.pricingTier === "FREEMIUM"
                              ? "bg-amber-100 text-amber-700"
                              : submission.pricingTier === "OPEN_SOURCE"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {formatPricingTier(submission.pricingTier)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`mailto:${submission.email}`}
                          className="text-sm text-purple-600 hover:underline"
                        >
                          {submission.email}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            submission.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : submission.status === "REVIEWED"
                              ? "bg-blue-100 text-blue-700"
                              : submission.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(submission.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <QuickActions
                            submissionId={submission.id}
                            currentStatus={submission.status}
                          />
                          <Link
                            href={`/admin/submissions/${submission.id}`}
                            className="text-sm text-purple-600 hover:text-purple-800"
                          >
                            Review →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

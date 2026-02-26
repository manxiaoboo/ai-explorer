import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { NewsStatus } from "@prisma/client";
import { PublishPendingButton } from "./PublishPendingButton";
import { DeletePendingButton } from "./DeletePendingButton";

export const metadata: Metadata = {
  title: "Review Pending News - Admin",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getPendingNews() {
  return prisma.news.findMany({
    where: { 
      status: { in: [NewsStatus.PENDING, NewsStatus.REVIEWED] },
      isPublished: false 
    },
    orderBy: [
      { status: 'desc' }, // REVIEWED first
      { createdAt: 'desc' }
    ],
    include: {
      mentions: {
        include: {
          tool: {
            select: { id: true, name: true, slug: true }
          }
        }
      }
    }
  });
}

export default async function ReviewNewsPage() {
  const pendingNews = await getPendingNews();
  const readyToPublish = pendingNews.filter(n => n.status === NewsStatus.REVIEWED);
  const needsAnalysis = pendingNews.filter(n => n.status === NewsStatus.PENDING);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold">Review Pending News</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-600">
              {readyToPublish.length} ready to publish
            </span>
            <span className="text-sm text-amber-600">
              {needsAnalysis.length} needs review
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {pendingNews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No pending articles</h2>
            <p className="text-gray-600 mb-6">
              Run <code className="bg-gray-100 px-2 py-1 rounded">npx tsx scripts/aggregate-news.ts</code> to fetch new articles.
            </p>
            <Link
              href="/admin/news"
              className="text-blue-600 hover:text-blue-800"
            >
              View published news →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ready to Publish Section */}
            {readyToPublish.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Ready to Publish ({readyToPublish.length})
                </h2>
                <div className="space-y-4">
                  {readyToPublish.map((news) => (
                    <ArticleCard key={news.id} news={news} hasAnalysis={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Needs Review Section */}
            {needsAnalysis.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-amber-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Needs Review ({needsAnalysis.length})
                </h2>
                <div className="space-y-4">
                  {needsAnalysis.map((news) => (
                    <ArticleCard key={news.id} news={news} hasAnalysis={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Article Card Component
function ArticleCard({ 
  news, 
  hasAnalysis 
}: { 
  news: any; 
  hasAnalysis: boolean;
}) {
  const mentionedTools = news.mentions || [];
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${!hasAnalysis ? 'opacity-90' : ''}`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Title Row */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{news.title}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {news.source}
              </span>
              {mentionedTools.length > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {mentionedTools.length} tools linked
                </span>
              )}
            </div>
            
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>Source: <a href={news.originalUrl || '#'} target="_blank" className="text-blue-600 hover:underline">{news.source} ↗</a></span>
              <span>•</span>
              <span>Added: {new Date(news.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Content Preview */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Content Preview:</div>
              <div 
                className="text-sm text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: news.content.substring(0, 800) + (news.content.length > 800 ? '...' : '') 
                }}
              />
              {news.content.length > 800 && (
                <div className="mt-2">
                  <a 
                    href={news.originalUrl || '#'} 
                    target="_blank" 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Read full article ↗
                  </a>
                </div>
              )}
            </div>

            {/* Linked Tools */}
            {mentionedTools.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mentionedTools.map((m: any) => (
                  <span key={m.tool.id} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                    🔗 {m.tool.name} ({m.mentions}×)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {!hasAnalysis && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2 w-48">
                <div className="text-xs text-amber-800 mb-1">⚠️ Needs AI analysis</div>
                <div className="text-xs text-amber-600">You can still publish with original content</div>
              </div>
            )}
            
            <PublishPendingButton newsId={news.id} title={news.title} />
            <DeletePendingButton newsId={news.id} title={news.title} />
          </div>
        </div>
      </div>
    </div>
  );
}

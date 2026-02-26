import { Metadata } from "next";
import Link from "next/link";
import * as fs from 'fs';
import * as path from 'path';
import { PublishPendingButton } from "./PublishPendingButton";
import { DeletePendingButton } from "./DeletePendingButton";

export const metadata: Metadata = {
  title: "Review Pending News - Admin",
};

interface PendingArticle {
  slug: string;
  title: string;
  originalUrl: string;
  source: string;
  author?: string;
  publishedAt: string;
  content: string;
  mentionedTools: Array<{
    toolId: string;
    toolName: string;
    mentions: number;
  }>;
  fetchedAt: string;
  status: string;
  aiAnalysis?: {
    summary: string;
    keyPoints: string[];
    relevanceScore: number;
    qualityScore: number;
  };
}

function getPendingArticles(): Array<{ file: string; data: PendingArticle }> {
  const reviewDir = path.join(process.cwd(), 'pending-reviews');
  
  if (!fs.existsSync(reviewDir)) {
    return [];
  }
  
  const files = fs.readdirSync(reviewDir).filter(f => f.endsWith('.json'));
  
  return files.map(file => {
    const filePath = path.join(reviewDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return { file, data };
  }).sort((a, b) => {
    // Sort by whether AI analysis is complete
    const aComplete = a.data.aiAnalysis && !a.data.aiAnalysis.summary.includes('[');
    const bComplete = b.data.aiAnalysis && !b.data.aiAnalysis.summary.includes('[');
    return Number(bComplete) - Number(aComplete);
  });
}

export default async function ReviewNewsPage() {
  const pendingArticles = getPendingArticles();
  const readyToPublish = pendingArticles.filter(
    ({ data }) => data.aiAnalysis && !data.aiAnalysis.summary.includes('[')
  );
  const needsAnalysis = pendingArticles.filter(
    ({ data }) => !data.aiAnalysis || data.aiAnalysis.summary.includes('[')
  );

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
            <span className="text-sm text-gray-600">
              {readyToPublish.length} ready to publish
            </span>
            <span className="text-sm text-amber-600">
              {needsAnalysis.length} needs AI analysis
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {pendingArticles.length === 0 ? (
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
                  {readyToPublish.map(({ file, data }) => (
                    <div key={file} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{data.title}</h3>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {data.source}
                              </span>
                              {data.mentionedTools.length > 0 && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  {data.mentionedTools.length} tools linked
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                              <span>Source: <a href={data.originalUrl} target="_blank" className="text-blue-600 hover:underline">{data.source} ↗</a></span>
                              <span>•</span>
                              <span>Fetched: {new Date(data.fetchedAt).toLocaleDateString()}</span>
                              {data.aiAnalysis && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600">Quality: {data.aiAnalysis.qualityScore}/100</span>
                                </>
                              )}
                            </div>

                            {data.aiAnalysis && (
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="text-sm font-medium text-gray-700 mb-2">AI Summary:</div>
                                <p className="text-gray-600 text-sm mb-3">{data.aiAnalysis.summary}</p>
                                <div className="flex flex-wrap gap-2">
                                  {data.aiAnalysis.keyPoints.map((point, i) => (
                                    <span key={i} className="text-xs bg-white px-2 py-1 rounded border">
                                      {point}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {data.mentionedTools.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {data.mentionedTools.map(tool => (
                                  <span key={tool.toolId} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                                    🔗 {tool.toolName} ({tool.mentions}×)
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <PublishPendingButton fileName={file} title={data.title} />
                            <DeletePendingButton fileName={file} title={data.title} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Needs Analysis Section */}
            {needsAnalysis.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-amber-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Needs AI Analysis ({needsAnalysis.length})
                </h2>
                <div className="space-y-4">
                  {needsAnalysis.map(({ file, data }) => (
                    <div key={file} className="bg-white rounded-xl shadow-sm border overflow-hidden opacity-75">
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{data.title}</h3>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {data.source}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                              <span>Source: <a href={data.originalUrl} target="_blank" className="text-blue-600 hover:underline">{data.source} ↗</a></span>
                              <span>•</span>
                              <span>Fetched: {new Date(data.fetchedAt).toLocaleDateString()}</span>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                              <div className="text-sm text-amber-800 mb-2">
                                ⚠️ This article needs AI analysis before publishing.
                              </div>
                              <div className="text-xs text-amber-700">
                                File: <code className="bg-white px-1 rounded">pending-reviews/{file}</code>
                              </div>
                            </div>

                            <div className="text-sm text-gray-600 line-clamp-3">
                              {data.content.substring(0, 300)}...
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <DeletePendingButton fileName={file} title={data.title} />
                          </div>
                        </div>
                      </div>
                    </div>
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

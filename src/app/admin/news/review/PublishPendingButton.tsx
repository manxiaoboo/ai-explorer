'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PublishPendingButtonProps {
  newsId: string;
  title: string;
}

export function PublishPendingButton({ newsId, title }: PublishPendingButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  async function handlePublish() {
    if (!confirm(`Publish "${title}"?`)) return;
    
    setIsPublishing(true);
    try {
      const response = await fetch('/api/admin/news/publish-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId }),
      });
      
      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to publish');
      }
    } catch (error) {
      alert('Error publishing article');
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <button
      onClick={handlePublish}
      disabled={isPublishing}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
    >
      {isPublishing ? 'Publishing...' : 'Publish'}
    </button>
  );
}

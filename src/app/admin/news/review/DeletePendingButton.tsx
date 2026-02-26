'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeletePendingButtonProps {
  fileName: string;
  title: string;
}

export function DeletePendingButton({ fileName, title }: DeletePendingButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/news/delete-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      
      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      alert('Error deleting article');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}

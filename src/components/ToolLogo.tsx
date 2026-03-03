/**
 * ToolLogo component with CDN support
 * Uses Vercel Blob for storage via proxy API
 */

'use client';

import Image from 'next/image';
import { getToolLogo } from '@/lib/logos';

interface ToolLogoProps {
  name: string;
  logo?: string | null;  // From database - can be CDN URL or proxy path
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

export function ToolLogo({ name, logo, size = 'md', className = '' }: ToolLogoProps) {
  const sizePx = sizeMap[size];
  
  // Determine image source
  let src: string;
  
  if (logo) {
    // Check if it's a Vercel Blob URL
    if (logo.includes('vercel-storage.com')) {
      // Extract the path from the URL
      const url = new URL(logo);
      const pathname = url.pathname.substring(1); // Remove leading slash
      // Use proxy API
      src = `/api/image?path=${encodeURIComponent(pathname)}`;
    } else if (logo.startsWith('http')) {
      // External URL
      src = logo;
    } else {
      // Local path
      src = logo;
    }
  } else {
    // Generate fallback SVG
    src = getToolLogo(name);
  }
  
  // For data URLs (generated SVGs), use unoptimized img
  const isDataUrl = src.startsWith('data:');
  
  if (isDataUrl) {
    return (
      <img
        src={src}
        alt={`${name} logo`}
        width={sizePx}
        height={sizePx}
        className={`rounded-lg object-cover ${className}`}
      />
    );
  }
  
  // For proxied images, use unoptimized to avoid Next.js optimization issues
  const isProxied = src.startsWith('/api/image');
  
  return (
    <Image
      src={src}
      alt={`${name} logo`}
      width={sizePx}
      height={sizePx}
      className={`rounded-lg object-cover ${className}`}
      unoptimized={isProxied}
    />
  );
}

/**
 * ToolLogo component with CDN support
 * Uses Vercel Blob for storage + Vercel Image Optimization
 */

'use client';

import Image from 'next/image';
import { getToolLogo } from '@/lib/logos';

interface ToolLogoProps {
  name: string;
  logo?: string | null;  // From database - can be local path or CDN URL
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
    // Use database logo (already CDN URL or local path)
    src = logo.startsWith('http') ? logo : `${process.env.NEXT_PUBLIC_CDN_URL || ''}${logo}`;
  } else {
    // Generate fallback SVG
    src = getToolLogo(name);
  }
  
  // For data URLs (generated SVGs), use unoptimized
  const isDataUrl = src.startsWith('data:');
  
  // For external URLs, use Vercel Image Optimization
  const isExternal = src.startsWith('http') && !src.includes('vercel-storage.com');
  
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
  
  return (
    <Image
      src={src}
      alt={`${name} logo`}
      width={sizePx}
      height={sizePx}
      className={`rounded-lg object-cover ${className}`}
      unoptimized={!isExternal} // Use Vercel optimization for external images
    />
  );
}

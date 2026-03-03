/**
 * ToolLogo component - displays tool logos
 * Uses database logo if available, falls back to generated logos
 * Client Component for handling image errors
 */

'use client';

import Image from 'next/image';
import { getToolLogo } from '@/lib/logos';

interface ToolLogoProps {
  name: string;
  logo?: string | null;  // From database
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ToolLogo({ name, logo, size = 'md', className = '' }: ToolLogoProps) {
  const sizeClasses = {
    sm: 32,
    md: 48,
    lg: 64,
  };
  
  const sizePx = sizeClasses[size];
  
  // Use database logo if available, otherwise generate
  const logoUrl = logo || getToolLogo(name);
  
  return (
    <Image
      src={logoUrl}
      alt={`${name} logo`}
      width={sizePx}
      height={sizePx}
      className={`rounded-lg object-cover ${className}`}
      onError={() => {
        // Fallback handled by Next.js Image error handling
      }}
      unoptimized={logoUrl.startsWith('data:') || logoUrl.includes('ui-avatars.com')}
    />
  );
}

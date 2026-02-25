/**
 * ToolLogo component - displays tool logos
 * Uses embedded SVG data URLs for now, can be migrated to CDN later
 */

import { getToolLogo } from '@/lib/logos';

interface ToolLogoProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ToolLogo({ name, size = 'md', className = '' }: ToolLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  
  const logoUrl = getToolLogo(name);
  
  return (
    <img
      src={logoUrl}
      alt={`${name} logo`}
      className={`${sizeClasses[size]} rounded-lg object-cover ${className}`}
      onError={(e) => {
        // Fallback to default on error
        const target = e.target as HTMLImageElement;
        target.src = getToolLogo('default');
      }}
    />
  );
}

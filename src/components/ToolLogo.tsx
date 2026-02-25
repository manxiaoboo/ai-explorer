/**
 * Update ToolCard to display logos
 */

interface ToolLogoProps {
  name: string;
  logo?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function ToolLogo({ name, logo, size = 'md' }: ToolLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
  };
  
  // If logo exists and is a local path
  if (logo?.startsWith('/logos/')) {
    return (
      <img
        src={logo}
        alt={name}
        className={`${sizeClasses[size]} rounded-lg object-cover bg-white`}
        onError={(e) => {
          // Fallback to initial on error
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
        }}
      />
    );
  }
  
  // Fallback to initial
  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 
                    flex items-center justify-center font-bold text-slate-700 fallback`}
    >
      {name[0]}
    </div>
  );
}

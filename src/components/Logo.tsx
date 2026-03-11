import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      {/* Warm Logo Icon */}
      <div className="w-9 h-9 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] 
                    rounded-xl flex items-center justify-center 
                    shadow-lg shadow-[var(--accent)]/25
                    transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-[var(--accent)]/30">
        <span className="text-white font-bold text-lg">a</span>
      </div>
      
      {/* Text Logo */}
      <span className="text-xl font-bold tracking-tight text-[var(--foreground)] lowercase">
        attooli
      </span>
    </Link>
  );
}

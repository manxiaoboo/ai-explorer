export function Logo() {
  return (
    <a href="/" className="flex items-center gap-2 group">
      {/* 图标占位符 - 蓝色方块 + 白色字母 a */}
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
        <span className="text-white font-bold text-lg">a</span>
      </div>
      
      {/* 文字 Logo */}
      <span className="text-2xl font-bold tracking-tight text-slate-900 lowercase">
        attooli
      </span>
    </a>
  );
}

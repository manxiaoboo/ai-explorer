# 性能诊断报告 - Atooli

## 🔴 严重问题 (立即修复)

### 1. /tools 页面强制动态渲染
**位置**: `src/app/tools/page.tsx` 第 97-98 行
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```
**影响**: 每次访问都实时查询数据库，无缓存
**修复**: 改为 ISR，每 5 分钟重新生成
```typescript
export const dynamic = 'force-static';
export const revalidate = 300;
```

### 2. 数据库查询无限制
**位置**: `src/app/page.tsx` 第 45-60 行
`getToolsByCategory()` 先查所有活跃工具，再在内存中分组
```typescript
const allTools = await prisma.tool.findMany({
  where: { isActive: true },  // 无数量限制！
  orderBy: { trendingScore: "desc" },
  include: { category: true },
});
```
**风险**: 工具数量增加后，这个查询会越来越慢
**修复**: 添加 `take: 100` 限制或使用聚合查询

---

## 🟡 中等问题 (本周修复)

### 3. 图片无优化
**位置**: `src/components/ToolLogo.tsx`
```typescript
<img src={logoUrl} ... />  // 原生 img，无 Next.js 优化
```
**影响**: 无懒加载、无格式优化、无尺寸适配
**修复**: 改用 `next/image`

### 4. 搜索 API 无防抖
**位置**: `src/components/HeroSearch.tsx` 第 44-60 行
每次输入变化 300ms 后都发请求，快速输入时产生多余请求

### 5. 大型组件未分割
- `src/app/tools/page.tsx` (511 行)
- `src/app/page.tsx` (398 行)
- `src/app/tools/[slug]/page.tsx` (350 行)

---

## 🟢 低风险优化

### 6. 字体预连接已配置 ✓
已在 `layout.tsx` 中添加 `preconnect`

### 7. 缓存头已配置 ✓
`next.config.ts` 中已配置 API 和静态资源缓存

---

## 修复优先级

| 优先级 | 问题 | 预期提升 |
|--------|------|----------|
| P0 | /tools 动态渲染 → ISR | 显著减少数据库查询 |
| P0 | 数据库查询加限制 | 防止性能随数据增长恶化 |
| P1 | 图片改用 next/image | 减少 LCP，支持懒加载 |
| P1 | 搜索防抖优化 | 减少 API 调用 |
| P2 | 组件代码分割 | 减少首屏 JS |

---

## 当前已优化项

✅ 首页 ISR (5分钟)  
✅ N+1 查询已修复（单次查询+内存分组）  
✅ 缓存头配置  
✅ 字体预连接  

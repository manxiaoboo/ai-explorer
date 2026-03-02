# 网站性能优化报告

## 发现的问题

### 1. 数据库查询优化
**问题**: 首页使用 `force-dynamic` 和 `revalidate = 0`，每次请求都查询数据库
**影响**: 高并发时数据库压力大，页面加载慢

**优化建议**:
```typescript
// 改为 ISR (增量静态再生)
export const dynamic = 'force-static';
export const revalidate = 3600; // 1小时重新生成
```

### 2. N+1 查询问题
**问题**: `getToolsByCategory()` 中循环查询每个分类的工具
**代码位置**: `src/app/page.tsx`

**优化方案**:
使用单个聚合查询代替循环查询：
```typescript
const toolsByCategory = await prisma.tool.groupBy({
  by: ['categoryId'],
  where: { isActive: true },
  orderBy: { trendingScore: 'desc' },
  take: 3,
});
```

### 3. 图片优化
**问题**: 
- `next.config.ts` 中 `images.domains` 已废弃
- 缺少图片尺寸优化

**优化方案**:
```typescript
// next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**.githubusercontent.com' },
    { protocol: 'https', hostname: '**.googleusercontent.com' },
  ],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
}
```

### 4. 字体优化
**问题**: 缺少字体预加载策略

**优化方案**:
在 layout.tsx 中添加：
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
```

### 5. CSS 优化
**问题**: `globals.css` 可能包含未使用的样式

**优化方案**:
- 使用 Tailwind CSS 的 purge 功能
- 检查并移除未使用的 CSS

### 6. JavaScript 优化
**问题**: 
- 缺少代码分割
- 大型组件没有懒加载

**优化方案**:
```typescript
// 动态导入大型组件
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

### 7. 缓存策略
**问题**: API 路由和页面缺少缓存头

**优化方案**:
在 `next.config.ts` 中添加：
```typescript
async headers() {
  return [
    {
      source: '/api/tools/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
      ],
    },
  ];
}
```

### 8. 数据库连接优化
**问题**: Prisma 连接池配置可能不足

**优化方案**:
在 `prisma/schema.prisma` 中添加：
```
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

## 优先级排序

| 优先级 | 优化项 | 预期提升 |
|--------|--------|----------|
| P0 | ISR/SSG 配置 | 显著减少数据库负载 |
| P0 | N+1 查询修复 | 减少查询次数 80%+ |
| P1 | 图片优化 | 减少 LCP 时间 |
| P1 | 缓存策略 | 提升缓存命中率 |
| P2 | 代码分割 | 减少首屏 JS 体积 |
| P2 | 字体优化 | 提升 FCP |

## 建议实施顺序

1. **立即实施**: ISR + N+1 查询修复
2. **本周实施**: 图片优化 + 缓存策略
3. **后续优化**: 代码分割 + 字体优化

# 新闻抓取双版本策略文档

## 背景

新闻抓取面临一个矛盾：
- **SEO 需要** 语义化、结构化的内容（Markdown）
- **用户体验** 需要保留原始排版样式（HTML）
- **内容质量** 原网站包含导航、广告、按钮等无关内容

## 解决方案

采用**双版本存储策略** + **智能内容过滤**：

```
┌─────────────────────────────────────────────────────────────┐
│                     News 表结构                              │
├─────────────────────────────────────────────────────────────┤
│  content       String    # Markdown (SEO 主版本)            │
│  contentHtml   String?   # 过滤后的 HTML (阅读模式)         │
│  displayMode   String    # "markdown" | "original"          │
└─────────────────────────────────────────────────────────────┘
```

## 抓取流程

```
抓取网页
    │
    ├─► 获取 innerHTML (完整 HTML)
    │
    ├─► 智能内容过滤 (extractCleanContent)
    │   ├─► 移除导航栏 (nav, header, navbar)
    │   ├─► 移除广告 (ad, advertisement, sponsored)
    │   ├─► 移除社交按钮 (social-share, share-buttons)
    │   ├─► 移除评论区 (comments, comment-section)
    │   ├─► 移除推荐内容 (related, recommended, read-more)
    │   ├─► 移除页脚 (footer, copyright)
    │   ├─► 移除订阅表单 (newsletter, subscribe)
    │   ├─► 移除无意义链接 ("Read more", "Learn more" 等)
    │   └─► 移除空元素和按钮
    │
    ├─► htmlToMarkdown() 转换为 Markdown
    │   - 标题 → # ## ###
    │   - 图片 → ![alt](url)
    │   - 列表 → * / 1.
    │   - 加粗 → **text**
    │   - 链接 → [text](url)
    │   - 表格 → [Table: ...]
    │
    ├─► 清理 HTML (XSS 防护)
    │   - 移除 <script> 标签
    │   - 移除 <style> 标签
    │   - 移除事件处理器 (onclick 等)
    │   - 限制大小 (50KB)
    │
    └─► 保存到数据库
        - content: Markdown
        - contentHtml: 过滤后的 HTML
        - displayMode: "markdown" (默认)
```

## 智能内容过滤

### 噪音元素选择器

```typescript
const NOISE_SELECTORS = [
  // Navigation
  'nav', 'header', '.header', '#header', '.navbar', '.navigation', '.menu', '.sidebar',
  
  // Ads
  '.ad', '.ads', '.advertisement', '.sponsored', '[class*="ad-"]', '.banner-ad',
  
  // Social sharing
  '.social-share', '.share-buttons', '.social-media', '.follow-us',
  
  // Comments
  '.comments', '#comments', '.comment-section', '#disqus',
  
  // Related content
  '.related', '.related-posts', '.recommended', '.you-may-like', '.read-more',
  
  // Footers
  'footer', '.footer', '.site-footer', '.copyright',
  
  // Newsletter / CTA
  '.newsletter', '.subscribe', '.signup-form', '.email-capture',
  
  // Tags/Categories
  '.tag-list', '.category-list', '.post-tags',
  
  // Other
  '.breadcrumb', '.pagination'
];
```

### 噪音链接模式

```typescript
const NOISE_LINK_PATTERNS = [
  /^read more$/i, /^continue reading$/i, /^learn more$/i,
  /^click here$/i, /^download$/i, /^subscribe$/i, /^sign up$/i,
  /^share$/i, /^tweet$/i, /^facebook$/i, /^linkedin$/i,
  /^copy link$/i, /^print$/i, /^load more$/i, /^show more$/i,
  /^view all$/i, /^see all$/i, /^previous$/i, /^next$/i
];
```

### 过滤逻辑

1. **识别主要内容容器**
   - 优先使用 `article`, `main`, `[role="main"]` 等语义化标签
   - 回退到基于文本密度的算法

2. **移除噪音元素**
   - 遍历噪音选择器列表
   - 检查元素是否包含段落 (`<p>`)
   - 如果元素短于 150 字符或无段落，则移除

3. **清理链接**
   - 检查所有 `<a>` 标签的文本内容
   - 匹配噪音链接模式
   - 将噪音链接替换为纯文本

4. **移除交互元素**
   - 移除所有 `<button>` 元素
   - 移除空元素

## 前端展示

### 默认模式 (SEO 优先)
```tsx
// Markdown 渲染为语义化 HTML
<div className="prose" 
     dangerouslySetInnerHTML={{ __html: renderMarkdown(news.content) }} 
/>
```

### 原文模式 (体验优先)
```tsx
// 沙箱渲染过滤后的 HTML
<iframe 
  srcDoc={news.contentHtml}
  sandbox="allow-same-origin"
/>
```

### 用户切换
```tsx
<a href={`?mode=original`}>📄 查看原文排版</a>
<a href={`?mode=markdown`}>📝 查看简洁版</a>
```

## 安全措施

### HTML 清理白名单
- ✅ 允许: `p`, `h1`-`h6`, `img`, `a`, `ul`, `ol`, `li`, `table`, `tr`, `td`, `th`, `blockquote`, `code`, `pre`
- ✅ 允许属性: `src`, `href`, `alt`, `class`
- ❌ 移除: `script`, `style`, `iframe`, `form`, 所有事件处理器

### 实现代码
```typescript
const sanitizedHtml = htmlContent
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/\s*on\w+=["'][^"']*["']/gi, '')
  .substring(0, 50000);
```

## SEO 最佳实践

1. **默认展示 Markdown** → 语义化 HTML，利于搜索引擎理解
2. **canonical 标签** → 指定主版本 URL，避免重复内容惩罚
3. **结构化数据** → 添加 JSON-LD 标记
4. **原文链接** → 提供「阅读原文」选项，但不作为默认

## 文件位置

- 抓取脚本: `scripts/aggregate-news.ts`
  - `extractCleanContent()` - 智能内容过滤函数
  - `htmlToMarkdown()` - HTML 转 Markdown
- 文档: `docs/NEWS_DUAL_VERSION_STRATEGY.md`
- Schema: `prisma/schema.prisma`

## 记住这个方案

当用户说「抓取新闻」时：
1. 运行 `aggregate-news.ts`
2. **自动移除无关内容**（导航、广告、按钮等）
3. 自动保存 Markdown + 过滤后的 HTML
4. 默认 Markdown 展示（SEO 友好）
5. 提供「阅读原文」选项

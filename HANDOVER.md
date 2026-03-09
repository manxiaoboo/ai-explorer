# 🤖 OpenClaw 交接文档 - Atooli AI 工具导航站

> **致下一个我**: 这是 Atooli 项目的完整交接文档。我是上一个维护这个项目的 OpenClaw 实例，以下是我积累的所有关键信息。

---

## 📋 项目概览

| 属性 | 详情 |
|------|------|
| **项目名称** | Atooli (原 ai-explorer) |
| **定位** | 全球最大的开源 AI 工具导航站 |
| **当前状态** | ✅ 生产环境运行中 |
| **部署平台** | Vercel + Prisma Accelerate |
| **收录工具** | 333+ AI 工具 |
| **数据库** | PostgreSQL (Prisma Accelerate) |

---

## 🏗️ 技术架构

### 核心栈
```
Frontend: Next.js 16 + React 19 + Tailwind CSS
Backend: Next.js API Routes (Serverless)
Database: PostgreSQL (Prisma Accelerate)
CDN: Vercel Blob Storage
Cron: Vercel Cron + 本地 Cron 双保险
```

### 关键目录结构
```
ai-explorer/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes (Cron, Search)
│   │   ├── tools/        # 工具详情页 [id]/page.tsx
│   │   ├── category/     # 分类页 [slug]/page.tsx
│   │   └── trending/     # Trending 榜单
│   ├── components/       # React 组件
│   └── lib/
│       ├── prisma.ts     # Prisma Client 单例
│       └── utils.ts      # 工具函数
├── scripts/              # 74 个自动化脚本 (见下文)
├── prisma/
│   └── schema.prisma     # 数据库模型
├── data/                 # 临时数据文件
├── docs/                 # 策略文档
└── vercel.json           # Vercel 配置 + Cron
```

---

## 🔐 环境变量配置

### 必需变量

```bash
# 数据库 - Prisma Postgres (Prisma Accelerate)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=...

# Cron Job 认证密钥
CRON_SECRET=your-cron-secret

# GitHub Token (用于 API 抓取)
GITHUB_TOKEN=ghp_xxx
```

### 可选变量

```bash
# Vercel Blob Storage (图片 CDN)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
NEXT_PUBLIC_CDN_URL=https://blob.vercel-storage.com

# 缓存重验证密钥
REVALIDATE_SECRET=atooli-revalidate-2024-secure-key
```

### 获取方式

1. **Prisma Accelerate**: https://www.prisma.io/data-platform/accelerate
2. **Vercel Blob**: https://vercel.com/dashboard/stores
3. **GitHub Token**: Settings → Developer settings → Personal access tokens → Tokens (classic)

---

## 📜 核心脚本使用指南

### 🎯 严肃工具挖掘 (推荐方式)

这是**质量优先**的工具挖掘策略，替代了旧的关键词批量抓取。

```bash
# 1. 严肃挖掘 (会生成 data/serious-mined-tools.json)
npx tsx scripts/serious-tool-mining.ts

# 2. 查看挖掘结果
cat data/serious-mined-tools.json | jq '.[] | {name, qualityScore, category}'

# 3. 导入高质量工具 (Score >= 60)
npx tsx scripts/import-quality-tools.ts --min-score=60
```

**特点**:
- 从 GitHub Trending、Product Hunt、Hacker News 等权威来源挖掘
- 质量评分 100 分制 (GitHub 健康度 40% + 产品完整度 30% + ...)
- 智能功能分类 (基于 topics，非关键词匹配)
- 准入门槛: Stars >= 500, 90 天内更新, Score >= 60

### 📰 新闻抓取系统

采用「Markdown + HTML」双版本存储策略：

```bash
# 抓取新闻 (含智能内容过滤)
npx tsx scripts/aggregate-news.ts

# 处理已审核的新闻
npx tsx scripts/process-reviewed-news.ts

# 查看待审核新闻
npx tsx scripts/check-pending-news.ts
```

**内容过滤会自动移除**:
- 导航栏、广告、社交分享按钮
- 评论区、推荐内容、页脚
- 订阅表单、无意义链接

### 📊 数据更新脚本

```bash
# 更新 Trending Score (每天自动运行)
npx tsx scripts/daily-trending-update.ts

# 同步 GitHub Stars
npx tsx scripts/update-github-stars.ts

# 批量更新定价信息
npx tsx scripts/bulk-update-pricing.ts
```

**Trending Score 算法** (满分 100):
```typescript
const score = 
  githubScore * 0.25 +      // GitHub Stars
  growthScore * 0.10 +      // 7天增长
  phScore * 0.10 +          // Product Hunt
  hfScore * 0.05 +          // HuggingFace
  engagementScore * 0.15 +  // 平台互动
  qualityScore * 0.20 +     // 质量信号
  freshnessScore * 0.15;    // 新鲜度
```

### 🖼️ Logo 处理脚本

```bash
# 抓取 logo URL (从 Clearbit)
npx tsx scripts/fetch-logos.js

# 检查失效 logo
npx tsx scripts/check-broken-logos.ts

# 批量修复 logo
npx tsx scripts/fix-all-broken-logos.ts

# 上传到 Vercel Blob (需稳定网络)
npx tsx scripts/upload-logos-cdn.js
```

**Logo 来源优先级**:
1. Clearbit Logo API
2. GitHub 用户头像
3. 文字生成 SVG (fallback)

---

## ⏰ 自动化工作流

### Vercel Cron (云端)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/discover-tools",
      "schedule": "0 2 * * *"      // 每天 2 AM
    },
    {
      "path": "/api/cron/discover-tools-advanced", 
      "schedule": "0 6 * * 0"      // 每周日 6 AM
    }
  ]
}
```

### 本地 Cron (OpenClaw)

可以通过 OpenClaw 的 cron 功能设置:

```bash
# 每天 3 AM 更新 Trending Score
openclaw cron add \
  --name="daily-trending" \
  --schedule="0 3 * * *" \
  --command="cd /workspace/ai-explorer && npx tsx scripts/daily-trending-update.ts"

# 每周日 3 AM 发现新工具
openclaw cron add \
  --name="weekly-discovery" \
  --schedule="0 3 * * 0" \
  --command="cd /workspace/ai-explorer && npx tsx scripts/serious-tool-mining.ts"
```

---

## 🗄️ 数据库操作

### Prisma 命令

```bash
# 生成 Client
npx prisma generate

# 创建迁移
npx prisma migrate dev --name migration_name

# 部署迁移 (生产)
npx prisma migrate deploy

# 查看数据库
npx prisma studio

# 种子数据
npx prisma db seed
```

### 关键数据表

```prisma
// 工具表
model Tool {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  description   String
  website       String
  logo          String?  // Logo URL 或 Blob URL
  githubRepo    String?
  categoryId    String
  pricingTier   String   // free | freemium | paid | enterprise
  githubStars   Int?
  trendingScore Float    @default(0)
  clickCount    Int      @default(0)
  saveCount     Int      @default(0)
  isActive      Boolean  @default(true)
  isFeatured    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// 新闻表 (双版本存储)
model News {
  id            String   @id @default(cuid())
  title         String
  content       String   // Markdown (SEO 主版本)
  contentHtml   String?  // 原始 HTML (阅读模式)
  displayMode   String   @default("markdown")
  sourceUrl     String
  sourceName    String
  imageUrl      String?
  publishedAt   DateTime
  isPublished   Boolean  @default(false)
}
```

---

## 🔧 开发工作流

### 日常开发流程

```bash
# 1. 进入项目目录
cd /workspace/ai-explorer

# 2. 安装依赖
npm install

# 3. 开发模式
npm run dev

# 4. 构建 (检查错误)
npm run build

# 5. 推送到 Vercel (自动)
git push origin main
```

### 添加新工具流程

```bash
# 方式 1: 严肃挖掘 (推荐)
npx tsx scripts/serious-tool-mining.ts
# 审核 data/serious-mined-tools.json
npx tsx scripts/import-quality-tools.ts --min-score=60

# 方式 2: 手动添加
# 直接编辑 data/manual-tools.json
npx tsx scripts/import-tools.ts
```

### SEO 优化检查清单

```bash
# 批量填充 SEO 元数据
npx tsx scripts/bulk-fill-seo.ts

# 检查站点状态
npx tsx scripts/site-status-check.ts
```

---

## 🚨 常见问题和解决方案

### 1. Prisma 连接错误

**现象**: `Can't reach database server`

**解决**:
```bash
# 检查网络连接
ping accelerate.prisma-data.net

# 重新生成 Client
npx prisma generate

# 检查 DATABASE_URL 是否正确
```

### 2. GitHub API 限流

**现象**: `API rate limit exceeded`

**解决**:
- 检查 GITHUB_TOKEN 是否有效
- 添加 Token: `ghp_xxx` (classic token)
- 限速: 5000 req/hour (带 token)

### 3. Vercel Blob 上传失败

**现象**: 国内网络无法上传

**解决**:
- 使用海外服务器执行上传脚本
- 或暂时使用 Clearbit Logo API 作为 fallback

### 4. 构建失败 (数据库连接)

**现象**: `Error: Failed to connect to database` during build

**解决**:
- 已将所有使用 Prisma 的页面改为 `force-dynamic`
- Cron 路由使用 Node.js Runtime (非 Edge)

---

## 📝 关键文件说明

| 文件 | 用途 |
|------|------|
| `scripts/serious-tool-mining.ts` | 质量优先的工具挖掘 |
| `scripts/aggregate-news.ts` | 新闻抓取 (双版本存储) |
| `scripts/daily-trending-update.ts` | 每日 Trending 更新 |
| `docs/SERIOUS-MINING-STRATEGY.md` | 挖掘策略完整文档 |
| `docs/NEWS_DUAL_VERSION_STRATEGY.md` | 新闻存储策略文档 |
| `prisma/schema.prisma` | 数据库模型定义 |
| `vercel.json` | Vercel 配置 + Cron 任务 |

---

## 🔗 外部依赖

| 服务 | 用途 | 状态 |
|------|------|------|
| Vercel | 托管 + Serverless | ✅ 必需 |
| Prisma Accelerate | PostgreSQL 数据库 | ✅ 必需 |
| GitHub API | 工具数据抓取 | ✅ 必需 |
| Vercel Blob | Logo CDN | ⚠️ 可选 |
| Clearbit | Logo API | ✅ 备选 |

---

## 💡 给下一个我的建议

1. **数据质量 > 数量**: 坚持使用严肃挖掘策略，拒绝低质量工具
2. **定期审核**: 每月检查一次失效链接和过期工具
3. **SEO 持续优化**: 关注搜索排名，调整关键词策略
4. **监控趋势**: 关注 GitHub Trending，及时发现新兴工具
5. **备份数据**: 定期导出数据库备份

---

## 📞 紧急联系

如果遇到无法解决的问题:
1. 查看 Vercel Dashboard 日志
2. 检查 Prisma Accelerate 状态
3. 查阅 docs/ 目录下的策略文档

---

**交接日期**: 2026-03-09
**交接人**: OpenClaw 实例 (张居正模式)
**项目状态**: 稳定运行，333+ 工具，持续维护中

> "定目标，定期限，查结果。能者上，庸者下。" — 张居正

---

*祝工作顺利！*

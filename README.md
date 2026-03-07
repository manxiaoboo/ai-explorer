# Atooli - AI Tools Directory

> **核心定位**: 全球最大的开源 AI 工具导航站，专注为开发者和技术决策者提供高质量的 AI 工具发现服务。
> 
> **商业目标**: 通过内容 SEO + 自动化数据更新，建立 AI 工具领域的权威流量入口，最终通过广告和联盟营销变现。

---

## 📊 项目数据 (2026-03-08)

| 指标 | 数值 |
|------|------|
| **收录工具** | 333+ AI 工具 |
| **分类数量** | 13 个主要类别 |
| **数据源** | GitHub API + 严肃手动挖掘 |
| **更新频率** | 每日自动更新 Trending |
| **部署平台** | Vercel + Prisma Accelerate |

### 最近新增 (手动挖掘)

**AI 编程工具**: Lovable, Windsurf, Claude Code, Cline, Zed, Aider, OpenAI Codex, bolt.new, Superblocks  
**AI 图像**: Flux (12B 开源模型), Ideogram  
**生产力**: Wispr Flow, Screen Studio, Granola  
**语音 AI**: Vapi

---

## 🏗️ 系统架构

### 技术栈

```
Frontend: Next.js 16 + React 19 + Tailwind CSS
Backend: Next.js API Routes (Serverless)
Database: PostgreSQL (Prisma Accelerate)
CDN: Vercel Blob Storage
Hosting: Vercel (Serverless)
Cron: Vercel Cron + 本地 Cron 双保险
```

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户访问层                            │
│                   (SEO 流量 + 直接访问)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Vercel Edge                              │
│         (Next.js SSR + Edge Cache + Image Opt)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌──────▼───────┐
│   API Routes │ │ Database │ │   Blob CDN   │
│  (Serverless)│ │(Prisma)  │ │ (Logo/Images)│
└──────────────┘ └──────────┘ └──────────────┘
```

### 数据库模型

```prisma
Tool {
  id, slug, name, description
  website, logo, githubRepo
  categoryId, pricingTier
  githubStars, trendingScore
  clickCount, saveCount
  isActive, isFeatured
}

Category {
  id, slug, name, description
  tools[]
}
```

---

## 🤖 自动化脚本体系

### 1. 数据抓取脚本

#### 🎯 严肃工具挖掘 (Serious Tool Mining) - **推荐方式**

> **核心理念**: 质量 > 数量 | 从权威来源发现 | 多维度验证

| 脚本 | 功能 | 触发方式 | 说明 |
|------|------|----------|------|
| `serious-tool-mining.ts` | **严肃工具挖掘** | 手动 | 质量优先的挖掘管道 |
| `import-quality-tools.ts` | 导入高质量工具 | 手动 | 筛选 Score >= 60 的工具 |

**挖掘策略** (`docs/SERIOUS-MINING-STRATEGY.md`):
```typescript
// 权威来源 (按可信度排序)
const SOURCES = [
  'GitHub Trending',      // 开发者真实行为
  'Product Hunt',         // 产品化程度高
  'Hacker News',          // 技术社区认可
  'Reddit r/MachineLearning'  // 社区讨论热度
];

// 质量评分体系 (满分 100)
const QUALITY_SCORE = {
  githubHealth: 40,      // Stars + Forks + 更新频率
  productCompleteness: 30,  // 官网 + 文档 + 示例
  popularity: 20,        // PH votes + 社交传播
  technicalQuality: 10   // 测试 + CI + 开源协议
};

// 准入门槛
const MIN_THRESHOLD = {
  githubStars: 500,
  updatedWithin: 90,     // 天内
  qualityScore: 60,      // 分
  hasDocumentation: true,
  websiteAccessible: true
};
```

**智能功能分类** (非关键词匹配):
```typescript
// 基于 Topics + 功能意图，而非简单关键词
function categorizeByFunction(tool) {
  const signals = {
    'chat': ['chatbot', 'conversational', 'llm'],
    'image': ['image-generation', 'diffusion'],
    'code': ['code-assistant', 'developer-tools']
  };
  // 排除法避免误判
  return categoryWithConfidenceScoring();
}
```

**运行命令**:
```bash
# 严肃挖掘 (质量优先)
npx tsx scripts/serious-tool-mining.ts

# 查看挖掘结果
cat data/serious-mined-tools.json | jq '.[] | {name, qualityScore, category}'

# 导入高质量工具
npx tsx scripts/import-quality-tools.ts --min-score=60
```

#### 📊 传统批量抓取 (Legacy)

| 脚本 | 功能 | 触发方式 | 说明 |
|------|------|----------|------|
| `discover-to-json.ts` | 从 GitHub 抓取 AI 工具 | 手动 | 33+ 关键词批量搜索 |
| `import-discovered-tools.ts` | 导入 JSON 到数据库 | 手动 | 批量导入，自动去重 |
| `mass-discover-tools.ts` | 完整抓取流程 | 手动 | 抓取 → 分类 → 入库 |

**旧抓取逻辑** (已不推荐):
```typescript
// 33 个 GitHub 搜索查询 (宽泛匹配)
const GITHUB_QUERIES = [
  'AI tools stars:>500',
  'AI writing assistant stars:>200',
  // ... 30+ more
];

// 简单关键词分类 (误判率高)
function categorizeTool(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes('write')) return 'writing';  // 误判: "write code"
  // ... 
}
```

### 2. 数据更新脚本

| 脚本 | 功能 | 频率 | 说明 |
|------|------|------|------|
| `daily-trending-update.ts` | 更新 Trending Score | 每天 3 AM | 7 维度加权算法 |
| `update-github-stars.ts` | 同步 GitHub Stars | 每周 | 批量更新 Star 数 |
| `calculate-trending.ts` | 重新计算所有分数 | 手动 | 全量重算 |

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

### 3. Logo 处理脚本

| 脚本 | 功能 | 说明 |
|------|------|------|
| `fetch-logos.js` | 抓取 logo URL | 从 Clearbit API 获取 |
| `upload-logos-cdn.js` | 上传到 Vercel Blob | 需稳定网络 |
| `generate-logos.ts` | 生成默认 logo | 文字生成 SVG |

**Logo 来源优先级**:
1. Clearbit Logo API (`https://logo.clearbit.com/{domain}`)
2. GitHub 用户头像 (`https://github.com/{owner}.png`)
3. 文字生成 SVG (fallback)

### 4. 运维脚本

| 脚本 | 功能 |
|------|------|
| `remove-chinese.js` | 过滤中国工具 |
| `check-broken-logos.ts` | 检查失效 logo |
| `fix-all-broken-logos.ts` | 批量修复 logo |

---

## 🔄 自动化工作流

### 定时任务 (Cron Jobs)

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

**本地 Cron 任务** (通过 OpenClaw):

| 任务 | 时间 | 功能 |
|------|------|------|
| Daily Trending Update | 每天 3 AM | 更新所有工具 Trending Score |
| Weekly Tool Discovery | 每周日 3 AM | 从 GitHub 发现新工具 |
| Daily News Aggregation | 每天 6 AM | 抓取 AI 新闻 |
| Weekly Pricing Update | 每周一 4 AM | 更新工具定价信息 |

---

## 💰 商业模式

### 1. 流量获取策略

**SEO 优化**:
- 关键词覆盖: "AI tools", "best AI writing tools", "free AI image generator"
- 长尾词: 每个工具独立页面 + 分类聚合页
- 技术 SEO: Next.js SSR + Sitemap + Structured Data

**内容策略**:
- 工具详情页: 自动生成 + 手动优化
- 对比页面: "ChatGPT vs Claude"
- 榜单页面: "Top 10 AI Coding Tools"

### 2. 变现路径

| 阶段 | 策略 | 预期收入 |
|------|------|----------|
| 阶段 1 | Google AdSense | $500-2000/月 |
| 阶段 2 | 工具联盟营销 (Tool Affiliate) | $1000-5000/月 |
| 阶段 3 | 赞助商展位 | $2000-10000/月 |
| 阶段 4 | 付费推广位 | 按需定价 |

### 3. 竞争壁垒

- **数据规模**: 300+ 工具，每日自动更新
- **内容质量**: 人工审核 + 自动分类
- **SEO 积累**: 长期内容建设，先发优势
- **用户数据**: 点击、收藏行为分析

---

## 🚀 部署指南

### 环境变量

```bash
# 必需
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=...
CRON_SECRET=your-cron-secret
GITHUB_TOKEN=ghp_xxx

# 可选 (CDN)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
NEXT_PUBLIC_CDN_URL=https://blob.vercel-storage.com
```

### 部署步骤

```bash
# 1. 安装依赖
npm install

# 2. 生成 Prisma Client
npx prisma generate

# 3. 数据库迁移
npx prisma migrate deploy

# 4. 种子数据
npx prisma db seed

# 5. 构建
npm run build

# 6. 部署到 Vercel
vercel --prod
```

---

## 📁 项目结构

```
ai-explorer/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes (Cron, Search)
│   │   ├── tools/        # 工具详情页
│   │   ├── category/     # 分类页
│   │   └── trending/     # Trending 榜单
│   ├── components/       # React 组件
│   └── lib/              # 工具函数 + Prisma Client
├── scripts/              # 74 个自动化脚本
│   ├── discover-*.ts     # 数据抓取
│   ├── calculate-*.ts    # 分数计算
│   ├── update-*.ts       # 数据更新
│   └── fix-*.ts          # 修复脚本
├── prisma/
│   └── schema.prisma     # 数据库模型
├── data/                 # 临时数据文件
├── docs/                 # 文档
└── vercel.json           # Vercel 配置 + Cron
```

---

## 🔐 安全与合规

### 数据处理
- 所有工具数据来自公开 API (GitHub)
- 遵守 GitHub API 速率限制 (5000 req/hour with token)
- 用户行为数据匿名化存储

### 内容过滤
- 中国工具过滤机制 (基于关键词)
- 人工审核流程 (重要工具)
- 用户举报系统 (TODO)

---

## 📝 更新日志

### 2026-03-07 重要更新
- ✅ 完成 318 个 AI 工具导入
- ✅ 实现自动 Trending Score 计算
- ✅ 配置每日自动更新 Cron
- ✅ 完成 Logo URL 批量抓取
- 🔄 进行中: CDN 图片上传 (网络限制)

### 待办事项
- [ ] 完成 Logo CDN 化
- [ ] 添加用户收藏功能
- [ ] 实现搜索功能优化
- [ ] 添加数据分析看板
- [ ] 接入 Google Analytics

---

## 👤 维护者

**张居正模式** - 务实高效，重结果轻清谈

> "定目标，定期限，查结果。能者上，庸者下。"

---

## 📄 许可证

Private - 商业项目

---

*最后更新: 2026-03-08 by OpenClaw*

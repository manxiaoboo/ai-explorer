# AI News System - 完整使用指南

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      News Crawler System                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ RSS Sources  │───▶│  AI Analysis │───▶│   Database   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                           │       │
│         │                                           ▼       │
│         │                                    ┌──────────┐  │
│         │                                    │ PENDING  │  │
│         │                                    └────┬─────┘  │
│         │                                         │        │
│         ▼                                         ▼        │
│  ┌──────────────┐                        ┌──────────────┐  │
│  │  Threshold   │◀───────────────────────│ Admin Review │  │
│  │   Check      │   超过10条停止抓取     │   (You)      │  │
│  └──────────────┘                        └──────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 工作流程

### 1. 定时抓取 (每天早上 9 点)
```
fetch-news.ts
    ├── 检查未审核数量 (< 10)
    ├── 从 8 个 RSS 源抓取
    ├── 去重 (URL + 标题)
    ├── AI 分析内容
    └── 保存为 PENDING 状态
```

### 2. 审核流程 (手动)
```bash
# 查看待审核列表
npx tsx scripts/news-crawler/list-pending.ts

# 通过审核
npx tsx scripts/news-crawler/approve-news.ts [slug]

# 拒绝
npx tsx scripts/news-crawler/reject-news.ts [slug]
```

### 3. 安全机制
- **未审核阈值**: 默认 10 条，超过则自动停止抓取
- **防重复**: 检查 URL 和标题
- **时效性**: 只抓取最近 7 天的新闻
- **去重**: 标题相似度检测

## 数据源

| 优先级 | 来源 | 类型 | 说明 |
|--------|------|------|------|
| P0 | TechCrunch AI | RSS | 全球顶级科技媒体 |
| P0 | MIT Tech Review | RSS | 权威技术评论 |
| P0 | OpenAI Blog | RSS | 官方动态 |
| P0 | Google AI Blog | RSS | 研究前沿 |
| P1 | The Verge AI | RSS | 消费科技 |
| P1 | VentureBeat AI | RSS | 企业AI |
| P1 | Ars Technica | RSS | 深度报道 |
| P2 | Synced Review | RSS | 中文视角 |

## 数据结构

```typescript
interface News {
  // 基础信息
  title: string;           // 标题
  excerpt: string;         // AI生成摘要 (200字)
  content: string;         // Markdown正文
  contentHtml?: string;    // 原始HTML
  
  // 来源信息
  source: string;          // 来源网站
  originalUrl: string;     // 原文链接
  coverImage?: string;     // 封面图
  
  // 状态
  status: "PENDING" | "REVIEWED" | "PUBLISHED" | "REJECTED";
  isPublished: boolean;
  publishedAt?: Date;
  
  // AI分析
  aiAnalysis: {
    whyItMatters: string;
    keyPoints: string[];
    impact: "high" | "medium" | "low";
  };
  
  // 关联
  mentions: NewsToolMention[];  // 提及的工具
}
```

## 定时任务配置

### crontab (推荐)
```bash
# 编辑 crontab
crontab -e

# 每天早上 9 点抓取新闻
0 9 * * * cd /path/to/ai-explorer && npx tsx scripts/news-crawler/fetch-news.ts >> /tmp/atooli-news.log 2>&1

# 每小时检查一次（如果之前失败）
0 * * * * cd /path/to/ai-explorer && npx tsx scripts/news-crawler/fetch-news.ts >> /tmp/atooli-news.log 2>&1
```

### 手动运行
```bash
# 检查当前状态
npx tsx scripts/news-crawler/check-pending.ts

# 抓取新闻（会自动检查阈值）
npx tsx scripts/news-crawler/fetch-news.ts

# 查看待审核
npx tsx scripts/news-crawler/list-pending.ts

# 审核通过
npx tsx scripts/news-crawler/approve-news.ts the-ai-revolution-2024
```

## 常见问题

### Q: 为什么抓取停止了？
A: 检查未审核新闻数量：
```bash
npx tsx scripts/news-crawler/check-pending.ts
```
如果超过 10 条，请先审核现有新闻。

### Q: 如何修改未审核阈值？
A: 修改环境变量：
```env
MAX_PENDING_NEWS=20  # 改为20条
```

### Q: 如何调整每天抓取数量？
A: 修改环境变量：
```env
DAILY_FETCH_LIMIT=3  # 每天只抓3条
```

### Q: 如何添加新的RSS源？
A: 编辑 `scripts/news-crawler/fetch-news.ts`：
```typescript
const RSS_SOURCES = [
  ...
  {
    name: "New Source",
    url: "https://example.com/feed.xml",
    weight: 8,
  },
];
```

## 审核检查清单

- [ ] 标题准确且无错别字
- [ ] 摘要概括了核心内容
- [ ] 正文格式正确 (Markdown)
- [ ] 来源可访问 (originalUrl)
- [ ] 没有版权问题
- [ ] 与网站主题相关 (AI工具)
- [ ] 不是重复内容

## 安全特性

1. **防重复**: URL + 标题双重检查
2. **时效性**: 只抓7天内新闻
3. **防刷**: 未审核阈值限制
4. **审核机制**: 人工确认后才发布
5. **日志记录**: 所有操作可追溯

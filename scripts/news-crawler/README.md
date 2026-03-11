# AI News Crawler - 新闻抓取系统

## 设计理念

- ✅ 每天从权威源抓取 5 条新闻
- ✅ 保存为 PENDING 状态等待审核
- ✅ **如果未审核新闻超过阈值，自动停止抓取**
- ✅ 本地运行，操作远程数据库
- ✅ 智能内容提取和 AI 分析

## 数据源配置

| 源名称 | 类型 | 权重 | 说明 |
|--------|------|------|------|
| TechCrunch AI | RSS | 高 | 科技媒体权威 |
| The Verge AI | RSS | 高 | 消费科技 |
| MIT Tech Review | RSS | 高 | 学术权威 |
| VentureBeat AI | RSS | 中 | 企业AI |
| Ars Technica | RSS | 中 | 深度报道 |
| OpenAI Blog | RSS | 高 | 官方动态 |
| Google AI Blog | RSS | 高 | 研究前沿 |
| AI News | RSS | 中 | 垂直媒体 |

## 审核工作流

```
抓取新闻 → 保存PENDING → 等待审核 → 发布/拒绝
     ↑
     └──── 未审核过多 ──── 停止抓取 ────┘
```

## 环境变量

```env
# 数据库连接
DATABASE_URL="prisma+postgres://..."

# OpenAI API (用于内容分析)
OPENAI_API_KEY="sk-..."

# 可选: RSS抓取配置
MAX_PENDING_NEWS=10        # 未审核阈值，超过则停止
DAILY_FETCH_LIMIT=5        # 每天抓取数量
```

## 运行

```bash
# 检查当前未审核新闻数量
npx tsx scripts/news-crawler/check-pending.ts

# 手动抓取5条新闻
npx tsx scripts/news-crawler/fetch-news.ts

# 查看待审核列表
npx tsx scripts/news-crawler/list-pending.ts

# 设置为已审核 (通过slug)
npx tsx scripts/news-crawler/approve-news.ts [slug]
```

## 定时任务

```bash
# crontab -e
# 每天早上 9 点抓取新闻 (如果未审核不多)
0 9 * * * cd /path/to/ai-explorer && npx tsx scripts/news-crawler/fetch-news.ts >> /tmp/atooli-news.log 2>&1
```

## 数据结构

抓取的新闻包含：
- `title` - 标题
- `excerpt` - 摘要 (AI生成)
- `content` - Markdown正文
- `originalUrl` - 原文链接
- `source` - 来源网站
- `coverImage` - 封面图 (自动提取)
- `aiAnalysis` - AI分析 (whyItMatters, keyPoints, impact)
- `mentions` - 提及的工具 (自动关联)

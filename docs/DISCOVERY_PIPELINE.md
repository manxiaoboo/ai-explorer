# AI Tools 抓取策略文档

## 概述

本项目的 AI 工具数据通过自动化流水线抓取，结合多个数据源确保覆盖率和准确性。

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI Tools Discovery Pipeline                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  SearXNG    │  │   GitHub    │  │   Web       │             │
│  │  (本地搜索)  │  │  Trending   │  │  Scraping   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                      │
│              ┌─────────────────────┐                            │
│              │  Tool Extraction    │                            │
│              │  - 名称/官网提取     │                            │
│              │  - 描述自动生成      │                            │
│              │  - 智能分类          │                            │
│              └──────────┬──────────┘                            │
│                         ▼                                       │
│              ┌─────────────────────┐                            │
│              │   Logo Download     │                            │
│              │  - Clearbit API     │                            │
│              │  - Google Favicon   │                            │
│              │  - DuckDuckGo       │                            │
│              └──────────┬──────────┘                            │
│                         ▼                                       │
│              ┌─────────────────────┐                            │
│              │   Save to Database  │                            │
│              │   (Prisma Postgres) │                            │
│              └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 数据源

### 1. SearXNG 本地搜索

**用途**：发现最新 AI 工具

**搜索关键词**（10个分类）：
```
best AI writing tools 2025
AI image generator tools
AI code assistant developer tools
AI chatbot conversational AI
AI voice audio tools
AI video editing generation
AI data analysis visualization
AI productivity workflow automation
AI search engine research
AI design creative tools
```

**启动方式**：
```bash
docker-compose -f docker-compose.searxng.yml up -d
```

**验证**：
```bash
curl http://localhost:8080/healthz
# 返回 OK
```

---

### 2. GitHub Trending

**用途**：抓取开源 AI 项目

**搜索条件**：
- stars:>1000
- 关键词：AI tools, AI assistant, chatbot
- 排序：stars desc

**API 端点**：
```
https://api.github.com/search/repositories
```

---

### 3. Web Scraping

**用途**：补充工具详情

**技术**：
- Jina AI Reader API 提取网页内容
- 官网描述抓取
- 功能列表识别

---

## 分类规则

自动分类基于关键词匹配：

| 关键词 | 分类 |
|--------|------|
| image, photo, art | image |
| code, program, developer | code |
| write, content, copy | writing |
| chat, conversation, bot | chat |
| video, film | video |
| audio, voice, sound | audio |
| data, analytic | data |
| search, research | search |
| design, creative | design |
| market, seo | marketing |
| productivity, workflow | productivity |
| 其他 | other |

---

## Logo 获取策略

### 优先级

1. **Clearbit Logo API** (推荐)
   ```
   https://logo.clearbit.com/{domain}
   ```

2. **Google Favicon**
   ```
   https://www.google.com/s2/favicons?domain={domain}&sz=128
   ```

3. **DuckDuckGo**
   ```
   https://icons.duckduckgo.com/ip3/{domain}.ico
   ```

4. **自动生成**（备选）
   - 使用工具首字母
   - 随机渐变色背景
   - SVG 格式

---

## 执行流程

### 步骤 1：环境准备

```bash
# 1. 确保数据库连接
export DATABASE_ACCELERATE="prisma://..."

# 2. 启动 SearXNG（可选，网络好时）
docker-compose -f docker-compose.searxng.yml up -d
export SEARXNG_URL="http://localhost:8080"
```

### 步骤 2：运行抓取

```bash
# 完整流水线
npx tsx scripts/discover-tools-pipeline.ts

# 仅 GitHub
npx tsx scripts/discover-tools-pipeline.ts --source=github

# 批量导入 JSON
npx tsx scripts/import-tools.ts tools-batch.json
```

### 步骤 3：验证结果

```bash
# 检查新增数量
npx tsx scripts/check-logo-sources.ts
```

### 步骤 4：生成 Logo

```bash
# 为没有 Logo 的工具生成
npx tsx scripts/generate-logos.ts
```

---

## 限速与配额

| 数据源 | 限速 | 建议间隔 |
|--------|------|----------|
| SearXNG | 无限制 | 1s/请求 |
| GitHub API | 60/hour (未认证) | 2s/请求 |
| Clearbit | 无限制 | 500ms/请求 |
| Jina AI | 无限制 | 1s/请求 |

---

## 数据质量标准

### 必填字段
- [x] name (工具名称)
- [x] slug (URL标识)
- [x] website (官网)
- [x] categoryId (分类)

### 建议字段
- [ ] tagline (一句话描述)
- [ ] description (详细描述)
- [ ] features (功能列表)
- [ ] useCases (使用场景)
- [ ] pricingTier (定价类型)
- [ ] logo (Logo URL)

---

## 故障排查

### SearXNG 无法启动

**现象**：`docker pull timeout`

**解决**：
```bash
# 1. 配置 Docker 国内镜像
vim /etc/docker/daemon.json
# 添加: {"registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]}

# 2. 重启 Docker
systemctl restart docker

# 3. 重试启动
docker-compose -f docker-compose.searxng.yml up -d
```

### GitHub API 限流

**现象**：`403 API rate limit exceeded`

**解决**：
- 等待 1 小时后重试
- 或使用 GitHub Token 提高限额

### 数据库连接失败

**现象**：`Can't reach database server`

**解决**：
```bash
# 检查环境变量
env | grep DATABASE

# 测试连接
npx tsx scripts/test-accelerate.ts
```

---

## 更新频率建议

| 数据源 | 频率 | 触发方式 |
|--------|------|----------|
| SearXNG 搜索 | 每周 | 手动/Vercel Cron |
| GitHub Trending | 每天 | Vercel Cron |
| Logo 补全 | 按需 | 手动 |
| 定价更新 | 每月 | 手动 |

---

## 相关脚本

| 脚本 | 用途 |
|------|------|
| `discover-tools-pipeline.ts` | 主抓取流水线 |
| `import-tools.ts` | 批量导入 JSON |
| `seed-database.ts` | 初始化基础数据 |
| `seed-news.ts` | 初始化新闻数据 |
| `generate-logos.ts` | 生成缺失 Logo |
| `migrate-logos-to-cdn.ts` | 迁移 Logo 到 CDN |
| `check-logo-sources.ts` | 检查 Logo 来源统计 |
| `test-accelerate.ts` | 测试数据库连接 |

---

## 注意事项

1. **遵守 robots.txt**：抓取时尊重目标网站的爬虫协议
2. **限速控制**：避免对单一源请求过快
3. **数据去重**：基于 slug 去重，避免重复入库
4. **失败重试**：单个工具失败不影响整体流程
5. **日志记录**：每次抓取记录成功/失败数量

---

## 扩展建议

- [ ] 添加 Twitter/X 监控（官方账号发布）
- [ ] 添加 Product Hunt API
- [ ] 添加 RSS 订阅（TechCrunch, VentureBeat）
- [ ] 自动定价抓取（官网定价页面）
- [ ] AI 自动生成描述（使用 GPT 总结）

---

*最后更新：2026-03-06*

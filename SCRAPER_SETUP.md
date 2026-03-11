# AI Tools Directory 自动抓取系统

## 系统概述

本系统实现从 `aitoolsdirectory.com` 自动抓取 AI 工具数据并同步到 attooli (ai-explorer) 数据库。

### 主要功能

1. **每日自动抓取新工具** - 发现并添加新的 AI 工具
2. **每周数据更新** - 更新现有工具的价格、描述等信息
3. **自动分类映射** - 从数据源自动创建和映射分类
4. **Logo 自动上传** - 下载工具 Logo 并上传到 Vercel Blob CDN
5. **价格历史追踪** - 记录工具价格变化历史

## 文件结构

```
scripts/
├── lib/
│   ├── prisma.ts                    # Prisma 客户端配置
│   └── aitools-scraper.ts           # 抓取器核心逻辑
├── daily-scrape-aitools.ts          # 每日抓取脚本 (cron: 每天 2:00)
├── weekly-update-tools.ts           # 每周更新脚本 (cron: 每周日 3:00)
└── test-scrape.ts                   # 测试脚本
```

## 数据映射

### 从 aitoolsdirectory.com 到数据库

| 数据源字段 | 数据库字段 | 说明 |
|-----------|-----------|------|
| name | name, slug | 工具名称和 URL slug |
| category | categoryId | 自动映射到 Category 表 |
| pricing | pricingTier, hasFreeTier, hasTrial | 价格层级和免费选项 |
| description | description, tagline | 完整描述和简短描述 |
| logoUrl | logo | 上传到 CDN 后的 URL |
| website | website | 工具官网链接 |

### 分类自动映射

系统内置了常见分类的映射表，新分类会自动创建：

- Video Generation → video-generation
- Generative Art → generative-art
- Automation → automation
- AI Agents → ai-agents
- ... (共 20+ 个分类)

### 价格层级映射

| 数据源价格 | 数据库 PricingTier |
|-----------|-------------------|
| Free | FREE |
| Freemium | FREEMIUM |
| Paid | PAID |
| Open Source | OPEN_SOURCE |
| Enterprise/Contact | ENTERPRISE |

## 定时任务配置

### 使用 crontab (Linux/macOS)

```bash
# 编辑 crontab
crontab -e

# 添加以下行:
# 每天凌晨 2:00 运行新工具抓取
0 2 * * * cd /path/to/ai-explorer && /usr/bin/npx tsx scripts/daily-scrape-aitools.ts >> /var/log/aitools-scraper.log 2>&1

# 每周日凌晨 3:00 运行数据更新
0 3 * * 0 cd /path/to/ai-explorer && /usr/bin/npx tsx scripts/weekly-update-tools.ts >> /var/log/aitools-updater.log 2>&1
```

### 使用 systemd (Linux)

创建 `/etc/systemd/system/aitools-daily.service`:

```ini
[Unit]
Description=Daily AI Tools Scraper
After=network.target

[Service]
Type=oneshot
WorkingDirectory=/path/to/ai-explorer
ExecStart=/usr/bin/npx tsx scripts/daily-scrape-aitools.ts
Environment="DATABASE_URL=your_database_url"
Environment="BLOB_READ_WRITE_TOKEN=your_blob_token"
```

创建 `/etc/systemd/system/aitools-daily.timer`:

```ini
[Unit]
Description=Run AI Tools scraper daily

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

启用定时器:

```bash
sudo systemctl daemon-reload
sudo systemctl enable aitools-daily.timer
sudo systemctl start aitools-daily.timer
```

### 使用 Vercel Cron (如果使用 Vercel 托管)

在 `vercel.json` 中添加:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-scrape",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/weekly-update",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

## 环境变量

确保以下环境变量已设置:

```bash
# 数据库连接 (Prisma Accelerate)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=...

# Vercel Blob CDN (Logo 存储)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# CDN 基础 URL
NEXT_PUBLIC_CDN_URL=https://blob.vercel-storage.com

# Node 环境
NODE_ENV=production
```

## 运行脚本

### 测试抓取

```bash
cd /root/.openclaw/extensions/feishu/ai-explorer
npx tsx scripts/test-scrape.ts
```

### 手动运行每日抓取

```bash
cd /root/.openclaw/extensions/feishu/ai-explorer
npx tsx scripts/daily-scrape-aitools.ts
```

### 手动运行每周更新

```bash
cd /root/.openclaw/extensions/feishu/ai-explorer
npx tsx scripts/weekly-update-tools.ts
```

## 日志监控

### 查看日志

```bash
# 实时查看日志
tail -f /var/log/aitools-scraper.log

# 查看最后 100 行
tail -n 100 /var/log/aitools-scraper.log
```

### 日志内容示例

```
============================================================
开始每日抓取 - aitoolsdirectory.com
时间: 2026-03-09T23:30:00.000Z
============================================================

正在抓取工具数据...

发现 15 个分类页面
正在抓取分类: https://aitoolsdirectory.com/video-generation
正在抓取分类: https://aitoolsdirectory.com/generative-art
...

共抓取到 150 个工具

------------------------------------------------------------
  创建新分类: Video Generation (video-generation)
  ✓ 已添加工具: A2E AI Videos (Freemium)
  Logo 已上传: https://blob.vercel-storage.com/logos/aitoolsdirectory/a2e-ai-videos-1234567890.png
  跳过已存在工具: ThumbnailCreator
  ...

============================================================
抓取完成!
总计: 150 个工具
新增: 45 个
跳过(已存在): 105 个
失败: 0 个
============================================================
```

## 故障排查

### 1. 抓取失败 - 网站结构变化

如果 aitoolsdirectory.com 的页面结构发生变化:

1. 检查新的 HTML 结构
2. 更新 `scripts/lib/aitools-scraper.ts` 中的选择器
3. 重新测试

### 2. 数据库连接失败

检查 `DATABASE_URL` 环境变量是否正确设置，以及网络连接是否正常。

### 3. Logo 上传失败

检查 `BLOB_READ_WRITE_TOKEN` 是否有效，以及 Vercel Blob 配额是否已满。

### 4. 内存不足

如果抓取大量工具时内存不足:

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npx tsx scripts/daily-scrape-aitools.ts
```

## 扩展功能

### 添加新的数据源

1. 创建新的 scraper 类 (如 `scripts/lib/another-scraper.ts`)
2. 实现相同的 `ScrapedTool` 接口
3. 创建对应的每日抓取脚本
4. 添加到定时任务

### 自定义分类映射

编辑 `scripts/daily-scrape-aitools.ts` 中的 `CATEGORY_MAPPING`:

```typescript
const CATEGORY_MAPPING: Record<string, string> = {
  '新的数据源分类': '对应的数据库 slug',
  // ...
};
```

## 安全注意事项

1. **速率限制**: 脚本内置了延迟 (500ms-2000ms) 以避免对目标网站造成压力
2. **User-Agent**: 使用真实的浏览器 User-Agent
3. **错误处理**: 单个工具失败不会影响整体抓取
4. **环境变量**: 不要在代码中硬敏感信息

## 维护

### 定期检查

- 每月检查目标网站是否有结构变化
- 监控日志文件大小，配置日志轮转
- 检查 CDN 存储使用情况

### 更新依赖

```bash
npm update playwright-core @vercel/blob
npx playwright install chromium
```

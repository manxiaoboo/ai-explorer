# Vercel 部署服务器抓取指南

由于本地服务器无法访问外网，我们将抓取任务迁移到 Vercel 部署服务器执行。

---

## 优势

| 对比项 | 本地服务器 | Vercel 部署 |
|--------|-----------|-------------|
| 外网访问 | ❌ 受限 | ✅ 完全访问 |
| GitHub API | ❌ 限流严重 | ✅ 正常访问 |
| 运行时间 | 无限制 | 10s-5min (Pro) |
| 自动触发 | 需手动 | ✅ Cron 自动 |
| 日志记录 | 本地 | Vercel Dashboard |

---

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Platform                         │
│  ┌─────────────────┐      ┌─────────────────────────────┐  │
│  │   Cron Jobs     │      │      API Routes             │  │
│  │  ┌───────────┐  │      │  ┌─────────────────────┐    │  │
│  │  │ Daily 2AM │────┼──────▶│ /api/cron/discover  │    │  │
│  │  │ (Quick)   │  │      │  │ - Fast discovery    │    │  │
│  │  └───────────┘  │      │  │ - 10s timeout       │    │  │
│  │  ┌───────────┐  │      │  └─────────────────────┘    │  │
│  │  │ Weekly    │────┼──────▶│ /api/cron/discover- │    │  │
│  │  │ Sunday 6AM│  │      │  │   tools-advanced    │    │  │
│  │  │ (Full)    │  │      │  │ - Deep discovery    │    │  │
│  │  └───────────┘  │      │  │ - 5min timeout      │    │  │
│  └─────────────────┘      │  │ - More sources      │    │  │
│                           │  └─────────────────────┘    │  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Prisma Postgres │
                    │  (Via Accelerate)│
                    └─────────────────┘
```

---

## 配置步骤

### 1. 设置环境变量

在 Vercel Dashboard → Project → Settings → Environment Variables 添加：

```
# 必需
DATABASE_ACCELERATE=prisma://accelerate.prisma-data.net/?api_key=...
CRON_SECRET=your-secure-random-string

# 可选（提高 GitHub API 限额）
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 可选（启用更多数据源）
ALTERNATIVE_TO_API_KEY=...
```

### 2. 部署

```bash
# 推送代码到 main 分支
git push origin main

# Vercel 自动部署
```

### 3. 验证 Cron Jobs

在 Vercel Dashboard → Cron Jobs 查看：
- 确认两个任务已注册
- 查看下次执行时间
- 检查历史执行日志

---

## 手动触发

### 方法 1：使用 curl

```bash
# 快速抓取（10秒内完成）
curl -X POST https://your-site.vercel.app/api/cron/discover-tools \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 深度抓取（5分钟内完成）
curl -X POST https://your-site.vercel.app/api/cron/discover-tools-advanced \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 方法 2：管理界面

访问：`https://your-site.vercel.app/admin/discovery`

界面功能：
- 查看上次抓取时间
- 手动触发抓取
- 查看抓取统计
- 配置抓取参数

---

## Cron 时间表

| 任务 | 时间表 | 说明 |
|------|--------|------|
| `discover-tools` | `0 2 * * *` | 每天凌晨 2 点，快速抓取 GitHub 热门 |
| `discover-tools-advanced` | `0 6 * * 0` | 每周日凌晨 6 点，深度抓取更多源 |

Cron 表达式含义：
- `0 2 * * *` = 每天 2:00 AM
- `0 6 * * 0` = 每周日 6:00 AM

---

## API 响应格式

### 成功响应

```json
{
  "success": true,
  "discovered": 45,
  "saved": 12,
  "skipped": 33,
  "errors": [],
  "totalTools": 48,
  "durationMs": 8432,
  "timestamp": "2026-03-06T10:30:00.000Z"
}
```

### 失败响应

```json
{
  "success": false,
  "error": "GitHub API rate limit exceeded"
}
```

---

## 故障排查

### 问题 1：Cron Job 未执行

**检查**：
1. Vercel Dashboard → Cron Jobs 中是否显示任务
2. 环境变量 `CRON_SECRET` 是否设置
3. 查看 Vercel Function Logs

### 问题 2：GitHub API 限流

**解决**：
```bash
# 生成 GitHub Token
# https://github.com/settings/tokens
# 只需要 public_repo 权限

# 添加到 Vercel 环境变量
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

有 Token：5000 requests/hour  
无 Token：60 requests/hour

### 问题 3：执行超时

**快速版超时**：
- 正常现象，Vercel Hobby 计划限制 10 秒
- 已保存的工具会保留
- 下次执行会继续

**深度版超时**：
- 升级到 Vercel Pro 计划（支持 5 分钟）
- 或减少抓取源数量

### 问题 4：数据库连接失败

**检查**：
```bash
# 测试 Accelerate 连接
npx tsx scripts/test-accelerate.ts

# 确认环境变量已设置
# DATABASE_ACCELERATE 必须设置
```

---

## 监控与告警

### 在 Vercel Dashboard 查看

1. **Cron Jobs** 页面
   - 执行历史
   - 成功/失败率
   - 平均执行时间

2. **Analytics** 页面
   - API 调用次数
   - 错误率
   - 响应时间

3. **Logs** 页面
   - 实时日志
   - 错误详情
   - 调试信息

### 设置告警（可选）

使用 Vercel 的集成：
- Slack 通知
- Email 告警
- Webhook 回调

---

## 数据源扩展

### 添加新数据源

编辑 `src/app/api/cron/discover-tools-advanced/route.ts`：

```typescript
// 在 discoverTools() 函数中添加

// 3. Product Hunt
if (process.env.PRODUCT_HUNT_API_KEY) {
  const phTools = await fetchProductHunt();
  discovered.push(...phTools);
}

// 4. RSS Feed
const rssTools = await fetchRSSFeeds([
  'https://www.producthunt.com/feed',
  'https://news.ycombinator.com/rss',
]);
discovered.push(...rssTools);
```

---

## 与本地开发对比

| 场景 | 推荐方案 |
|------|----------|
| 快速测试抓取逻辑 | 本地开发 |
| 正式数据抓取 | Vercel Cron |
| 大规模批量导入 | 本地 + 上传 JSON |
| 紧急补充工具 | Vercel API 手动触发 |

---

## 最佳实践

1. **分层抓取**
   - 每天：快速抓取 GitHub 热门
   - 每周：深度抓取多源数据
   - 按需：手动触发补充

2. **错误处理**
   - 单个源失败不影响其他源
   - 记录错误日志便于排查
   - 自动重试机制

3. **数据去重**
   - 基于 slug 去重
   - 检查数据库已有数据
   - 避免重复录入

4. **限速控制**
   - GitHub API：1秒间隔
   - 其他 API：遵循文档限制
   - 超时保护机制

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `vercel.json` | Cron 任务配置 |
| `src/app/api/cron/discover-tools/route.ts` | 快速抓取 API |
| `src/app/api/cron/discover-tools-advanced/route.ts` | 深度抓取 API |
| `docs/DISCOVERY_PIPELINE.md` | 完整抓取策略文档 |

---

*最后更新：2026-03-06*

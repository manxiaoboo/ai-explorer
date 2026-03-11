# AI Tools Directory 抓取系统 - 快速启动指南

## 🚀 首次运行

### 1. 测试抓取功能

```bash
cd /root/.openclaw/extensions/feishu/ai-explorer
source .env
npx tsx scripts/test-scrape.ts
```

### 2. 手动运行每日抓取（添加新工具）

```bash
cd /root/.openclaw/extensions/feishu/ai-explorer
source .env
npx tsx scripts/daily-scrape-aitools.ts
```

### 3. 手动运行每周更新（更新现有工具）

```bash
cd /root/.openclaw/extensions/feishu/ai-explorer
source .env
npx tsx scripts/weekly-update-tools.ts
```

## ⏰ 设置自动定时任务

### 使用 PM2 (推荐)

```bash
# 安装 pm2
npm install -g pm2

# 创建 pm2 配置文件
cat > /root/.openclaw/extensions/feishu/ai-explorer/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'aitools-daily-scraper',
      script: 'npx',
      args: 'tsx scripts/daily-scrape-aitools.ts',
      cwd: '/root/.openclaw/extensions/feishu/ai-explorer',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 2 * * *',  // 每天 2:00
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/aitools-daily-error.log',
      out_file: '/var/log/aitools-daily-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'aitools-weekly-updater',
      script: 'npx',
      args: 'tsx scripts/weekly-update-tools.ts',
      cwd: '/root/.openclaw/extensions/feishu/ai-explorer',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 3 * * 0',  // 每周日 3:00
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/aitools-weekly-error.log',
      out_file: '/var/log/aitools-weekly-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
EOF

# 启动定时任务
pm2 start ecosystem.config.js

# 保存配置
pm2 save

# 设置开机启动
pm2 startup
```

### 使用传统 crontab

```bash
# 复制示例配置
cp scripts/crontab.example /tmp/crontab-new

# 编辑配置文件，修改路径
vim /tmp/crontab-new

# 应用配置
crontab /tmp/crontab-new

# 验证
 crontab -l
```

## 📊 查看运行状态

### 查看日志

```bash
# 实时查看每日抓取日志
tail -f /var/log/aitools-daily-out.log

# 查看错误日志
tail -f /var/log/aitools-daily-error.log

# 查看 PM2 状态
pm2 status
pm2 logs aitools-daily-scraper
```

### 查看数据库状态

```bash
cd /root/.openclaw/extensions/feishu/ai-explorer
npx prisma studio
# 或者运行查询
npx tsx -e "
import { prisma } from './scripts/lib/prisma';
async function stats() {
  const toolCount = await prisma.tool.count();
  const categoryCount = await prisma.category.count();
  console.log(\`工具总数: \${toolCount}\`);
  console.log(\`分类总数: \${categoryCount}\`);
}
stats().finally(() => prisma.\$disconnect());
"
```

## 🛠️ 故障排查

### 脚本运行失败

```bash
# 检查环境变量
echo $DATABASE_URL
echo $BLOB_READ_WRITE_TOKEN

# 测试数据库连接
cd /root/.openclaw/extensions/feishu/ai-explorer
npx prisma db pull

# 测试 CDN 连接
npx tsx -e "
import { list } from '@vercel/blob';
async function test() {
  const { blobs } = await list({ prefix: 'logos/' });
  console.log(\`CDN 中有 \${blobs.length} 个 logo\`);
}
test();
"
```

### 重新安装依赖

```bash
cd /root/.openclaw/extensions/feishu/ai-explorer
npm install
npx prisma generate
npx playwright install chromium
```

## 📝 重要文件

| 文件 | 说明 |
|------|------|
| `scripts/lib/aitools-scraper.ts` | 抓取器核心逻辑 |
| `scripts/daily-scrape-aitools.ts` | 每日抓取脚本 |
| `scripts/weekly-update-tools.ts` | 每周更新脚本 |
| `scripts/test-scrape.ts` | 测试脚本 |
| `SCRAPER_SETUP.md` | 完整文档 |

## 🔄 工作流程

```
每天 2:00 AM ──► 运行 daily-scrape-aitools.ts
                    │
                    ▼
            ┌──────────────┐
            │ 抓取新工具    │
            │ 下载 Logo     │
            │ 上传 CDN      │
            │ 写入数据库    │
            └──────────────┘
                    │
                    ▼
            新工具加入数据库

每周日 3:00 AM ──► 运行 weekly-update-tools.ts
                    │
                    ▼
            ┌──────────────┐
            │ 遍历现有工具  │
            │ 重新抓取数据  │
            │ 更新信息      │
            │ 记录价格历史  │
            └──────────────┘
                    │
                    ▼
            现有工具数据更新
```

## 💡 提示

- Logo 只会上传到 CDN 一次，之后会直接使用 CDN URL
- 价格变化会自动记录到 `PriceHistory` 表
- 新分类会自动创建，无需手动干预
- 已存在的工具会自动跳过，不会重复添加

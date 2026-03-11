# Local Task Runner - 本地定时任务

在本地运行所有数据更新任务，操作远程数据库。

## 设计理念

- ✅ 所有任务在**本地**运行，不占用服务器资源
- ✅ 直接连接**远程数据库** (Prisma Accelerate)
- ✅ 任务失败时本地日志便于调试
- ✅ 定时任务由本地系统管理 (crontab/Task Scheduler)

## 快速开始

### 1. 配置环境变量

```bash
# 复制示例文件
cp .env.local.example .env.local

# 编辑 .env.local，填入你的数据库 URL
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

### 2. 测试连接

```bash
npx tsx scripts/local-tasks/check-db.ts
```

### 3. 运行任务

```bash
# 完整更新 (GitHub + HuggingFace + Trending)
npx tsx scripts/local-tasks/run-all.ts

# 或者单独运行
npx tsx scripts/local-tasks/update-github.ts
npx tsx scripts/local-tasks/update-huggingface.ts
npx tsx scripts/local-tasks/calculate-trending.ts
```

## 设置定时任务

### macOS/Linux - crontab

```bash
# 编辑 crontab
crontab -e

# ========== 推荐方案：每天执行一次完整更新 ==========
# 每天早上 8 点执行所有任务 (包括 GitHub + HF + Trending)
0 8 * * * cd /path/to/ai-explorer && npx tsx scripts/local-tasks/run-all.ts >> /tmp/atooli.log 2>&1


# ========== 或者：分别执行各个任务 ==========
# 每小时更新 GitHub 数据
0 * * * * cd /path/to/ai-explorer && npx tsx scripts/local-tasks/update-github.ts >> /tmp/atooli-github.log 2>&1

# 每天早上 7 点更新 HuggingFace
0 7 * * * cd /path/to/ai-explorer && npx tsx scripts/local-tasks/update-huggingface.ts >> /tmp/atooli-hf.log 2>&1

# ⚠️ 重要：每天早上 8 点计算趋势分数 (必须每天执行!)
0 8 * * * cd /path/to/ai-explorer && npx tsx scripts/local-tasks/calculate-trending.ts >> /tmp/atooli-trending.log 2>&1
```

> 📋 复制 `crontab.example` 文件中的配置到你的 crontab

### Windows - 任务计划程序

1. 创建批处理文件 `C:\tools\atooli-tasks.bat`:
```batch
@echo off
cd C:\path\to\ai-explorer
npx tsx scripts\local-tasks\run-all.ts >> C:\logs\atooli.log 2>&1
```

2. 打开「任务计划程序」
3. 创建基本任务 → 名称: "Atooli Daily Update"
4. 触发器: 每天 8:00
5. 操作: 启动程序 → 选择 `C:\tools\atooli-tasks.bat`

### 使用 PM2 (高级)

```bash
# 安装 pm2
npm install -g pm2

# 创建任务配置
pm2 start scripts/local-tasks/ecosystem.config.js

# 查看日志
pm2 logs atooli-tasks
```

## 查看日志

```bash
# 实时查看
tail -f /tmp/atooli.log

# 搜索错误
grep "ERROR" /tmp/atooli.log

# 查看最新 100 行
tail -n 100 /tmp/atooli.log
```

## 📋 任务列表

| 任务 | 文件 | 说明 | 频率建议 |
|------|------|------|----------|
| 检查连接 | `check-db.ts` | 测试数据库连接 | 手动 |
| 修复数据 | `fix-missing-stats.ts` | 从 features 提取 GitHub stars | 首次运行 |
| GitHub 更新 | `update-github.ts` | 更新 stars/growth | 每天 1-2 次 |
| HuggingFace 更新 | `update-huggingface.ts` | 更新 downloads/likes | 每天 1 次 |
| **🔥 趋势分数** | **`calculate-trending.ts`** | **计算所有工具热度分数** | **⚠️ 必须每天执行** |
| 全部运行 | `run-all.ts` | 一键执行所有任务 | 每天 1 次 |

> ⚠️ **重要**: `calculate-trending.ts` 必须每天执行一次，否则 trending 页面数据不会更新！

## 热度算法 V2

### 权重分配
- **网站流量** (30%) - 近期点击、访问时长
- **用户互动** (20%) - 收藏、转化率  
- **增长率** (15%) - 热度加速度
- **平台数据** (25%) - GitHub/HF/PH (20万+ stars 可获得超额分数)
- **新鲜度** (10%) - 按小时递减

### 特点
- ✅ 真实反映工具热度，而非静态属性
- ✅ 高 stars 工具获得合理排名 (如 openclaw 29万 stars 排第1)
- ✅ 新工具有热度扶持，但随时间衰减
- ✅ 流量数据主导，避免只看出身

## 安全说明

- ✅ 只更新**统计字段** (`trendingScore`, `githubStars`, `hfDownloads` 等)
- ✅ 不修改**核心数据**（名称、URL、描述、logo）
- ✅ 使用 **Prisma Accelerate** 连接，无需开放数据库端口
- ✅ 支持连接字符串中的 API Key 认证

## 故障排查

### 连接失败
```bash
# 检查数据库 URL
npx tsx scripts/local-tasks/check-db.ts
```

### GitHub API 限制
```bash
# 添加 GITHUB_TOKEN 到 .env.local 以增加限额
# 从 https://github.com/settings/tokens 获取
```

### 任务中断
```bash
# 查看详细错误日志
cat /tmp/atooli.log | grep -A 5 "ERROR"
```

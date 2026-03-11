# 反检测抓取指南

本系统采用多重反检测机制，确保不会被目标网站识别为恶意爬虫。

## 🛡️ 反检测措施

### 1. 随机 User-Agent
每次初始化浏览器时，从 5 个真实浏览器 User-Agent 中随机选择：
- Chrome (Windows/Mac)
- Firefox
- Safari
- Edge

### 2. 随机延迟
- **页面间延迟**: 3-8 秒
- **详情页延迟**: 5-12 秒（更长）
- **分类间延迟**: 3-6 秒
- **每 10 个请求后休息**: 5-10 秒

### 3. 浏览器指纹模拟
- 随机 viewport 尺寸 (1920x1080)
- 设置 locale 和 timezone
- 模拟真实屏幕尺寸
- 添加合理的 HTTP 头

### 4. 会话限制
- 每 50 个请求自动重启浏览器
- 更换新的 User-Agent
- 清除所有 cookies 和缓存

### 5. 请求频率控制
```
默认配置:
├── 每个会话最多 50 个请求
├── 每次运行最多 5 个分类
├── 每个工具最多 30 个获取 logo
├── 失败时自动延长休息时间
```

### 6. 错误处理
- 网络超时时自动重试
- 被封 IP 时自动休息
- 单个工具失败不影响整体

## ⚠️ 抓取限制

为避免被封 IP，系统设置了以下限制：

### 每日抓取
- 最多抓取 5 个分类
- 每个分类最多处理前 N 个工具
- Logo 获取限制为前 10 个工具
- 预计耗时：10-20 分钟

### 每周更新
- 每次最多更新 30 个工具
- 按更新时间排序（优先更新最旧的）
- 预计耗时：15-30 分钟

## 🚀 降低被封风险的建议

### 1. 使用代理（可选增强）
如果需要更激进的抓取策略，可以添加代理：

```typescript
// 在 aitools-scraper.ts 中添加
const proxy = {
  server: 'http://your-proxy:port',
  username: 'username',
  password: 'password'
};

this.browser = await chromium.launch({
  proxy,
  // ... 其他配置
});
```

### 2. 调整运行时间
避免在目标网站高峰时段运行：
- 推荐时间：凌晨 2:00-6:00 (UTC)
- 避免时间：工作日上午 9:00-11:00

### 3. 降低频率
如果仍然被封，可以进一步降低频率：

```typescript
// 修改 daily-scrape-aitools.ts
let tools = await scraper.scrapeAllTools(3); // 从 5 改为 3
tools = await scraper.enrichToolsWithLogos(tools, 5); // 从 10 改为 5
```

### 4. 增加延迟
修改抓取器中的延迟参数：

```typescript
// 在 aitools-scraper.ts 中
await randomDelay(5000, 10000); // 增加基础延迟
```

## 📊 正常行为特征

以下是正常的抓取行为，不必担心：

| 现象 | 说明 | 是否正常 |
|------|------|---------|
| 每步都有 3-10 秒延迟 | 随机延迟防检测 | ✅ 正常 |
| 每 10 个请求后暂停 | 速率限制保护 | ✅ 正常 |
| 浏览器自动重启 | 会话限制触发 | ✅ 正常 |
| 单个工具抓取失败 | 网络波动或反爬 | ✅ 正常 |
| 耗时 10-30 分钟 | 温和抓取策略 | ✅ 正常 |

## 🚨 被封 IP 的迹象

如果出现以下情况，可能被封 IP：

1. **连续大量请求失败**
   ```
   Error: net::ERR_CONNECTION_RESET
   Error: net::ERR_CONNECTION_REFUSED
   ```

2. **返回验证码页面**
   ```
   页面内容包含 "captcha" 或 "verify"
   ```

3. **长时间无响应**
   ```
   TimeoutError: Navigation timeout
   ```

## 🛠️ 被封后的解决方案

### 1. 立即停止抓取
```bash
pm2 stop aitools-daily-scraper
pm2 stop aitools-weekly-updater
```

### 2. 等待 24 小时
大部分网站的 IP 封禁会在 24 小时后自动解除。

### 3. 降低抓取频率
编辑脚本，减少每次抓取的分类数量：

```typescript
// daily-scrape-aitools.ts
let tools = await scraper.scrapeAllTools(2); // 减少到 2 个分类
```

### 4. 使用代理（如果需要）
```typescript
// 配置代理服务器轮换
const proxies = [
  'http://proxy1:port',
  'http://proxy2:port',
  // ...
];
```

## 📈 监控建议

### 1. 检查日志
```bash
# 查看最近的错误
tail -n 100 /var/log/aitools-daily-error.log | grep -i "error\|fail\|timeout"
```

### 2. 监控成功率
```bash
# 统计成功/失败比例
grep -c "已添加工具" /var/log/aitools-daily-out.log
grep -c "抓取失败" /var/log/aitools-daily-out.log
```

### 3. 设置告警
如果连续 3 次抓取失败，发送通知：

```bash
# 添加到 crontab
*/30 * * * * /root/check-scraper-health.sh
```

## 📝 合规声明

本系统遵循以下原则：

1. **遵守 robots.txt** - 不抓取禁止的路径
2. **控制请求频率** - 不会对目标网站造成负担
3. **尊重数据版权** - 仅用于学习和研究目的
4. **不恶意竞争** - 不用于商业目的或恶意爬取

## 💡 最佳实践

1. **不要同时运行多个实例** - 避免双倍请求
2. **不要手动频繁运行** - 遵守定时任务频率
3. **监控日志文件** - 及时发现异常
4. **定期更新 User-Agent 列表** - 保持最新
5. **考虑目标网站感受** - 如非必要，不要过度抓取

## 🔗 相关文件

- `scripts/lib/aitools-scraper.ts` - 抓取器核心（反检测逻辑）
- `SCRAPER_SETUP.md` - 系统设置文档
- `QUICKSTART.md` - 快速启动指南

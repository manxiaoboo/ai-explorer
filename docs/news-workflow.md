# AI News Curation Workflow

## 新的工作流程（无Gemini自动分析）

### 第一步：抓取文章
```bash
npx tsx scripts/aggregate-news.ts
```
- 从RSS源抓取文章
- 识别提及的工具
- 保存到 `pending-reviews/` 目录

### 第二步：AI分析（由你执行）
抓取完成后，你会看到类似这样的输出：

```
📝 Pending Articles for AI Analysis:

1. OpenAI releases GPT-5
   File: /path/to/pending-reviews/openai-releases-gpt-5.json
   Tools: ChatGPT, OpenAI API

2. New AI coding assistant launched
   File: /path/to/pending-reviews/new-ai-coding-assistant.json
   Tools: Cursor, GitHub Copilot
```

**你的任务：**
1. 查看每个JSON文件
2. 用你喜欢的AI工具（Kimi、ChatGPT等）生成摘要
3. 填写 `aiAnalysis` 字段

示例JSON结构：
```json
{
  "title": "OpenAI releases GPT-5",
  "content": "...",
  "mentionedTools": [...],
  "aiAnalysis": {
    "summary": "OpenAI announced GPT-5 with significant improvements in reasoning and coding capabilities, available to Plus subscribers next month.",
    "keyPoints": [
      "50% improvement on coding benchmarks",
      "New reasoning capabilities for complex problem solving",
      "Rolling out to Plus users in phases"
    ],
    "relevanceScore": 95,
    "qualityScore": 90
  }
}
```

### 第三步：发布到数据库
```bash
npx tsx scripts/process-pending-articles.ts publish
```

## 策展原则（SEO安全）

✅ **必须做到：**
- 原创摘要（用自己的话写）
- 明确标注原文链接
- 简短摘要（<300字）
- 添加"Curated by Atooli"声明

❌ **禁止：**
- 复制原文超过300字
- 不标注来源
- 自动发布未经审核的内容

## 文件说明

| 文件 | 用途 |
|------|------|
| `aggregate-news.ts` | 抓取RSS，识别工具，生成待审核列表 |
| `process-pending-articles.ts` | 处理审核后的文章，发布到数据库 |
| `pending-reviews/*.json` | 待审核的文章（临时文件） |

# 严肃工具挖掘策略 (Serious Tool Mining Strategy)

## 核心理念转变

### ❌ 旧思路：抓取 (Scraping)
- 关键词匹配，宽泛抓取
- 数量优先，来者不拒
- 简单的 stars 阈值
- 关键词分类，误判率高

### ✅ 新思路：挖掘 (Mining)  
- 权威来源发现
- 质量优先，严格筛选
- 多维度质量评分
- 功能分类，精准定位

---

## 🔍 挖掘来源优先级

### Tier 1: 最可靠来源 (高置信度)

| 来源 | 优势 | 挖掘方式 |
|------|------|----------|
| **GitHub Trending** | 开发者真实行为 | API 搜索 + 更新频率筛选 |
| **Product Hunt** | 产品化程度高 | 每日热门 + 分类筛选 |
| **Hacker News** | 技术社区认可 | 热门帖 + AI 标签 |

### Tier 2: 辅助验证 (交叉验证)

| 来源 | 用途 | 指标 |
|------|------|------|
| **Reddit r/MachineLearning** | 社区讨论热度 | Upvotes, Comments |
| **Twitter/X Tech** | 社交传播度 | Mentions, Retweets |
| **权威 Newsletter** | 行业认可 | 被推荐的频率 |

### Tier 3: 排除清单 (负面信号)

- ❌ 长期不更新 (>6个月)
- ❌ 无文档/README
- ❌ 无实际用户 (只有 stars 无 forks/issues)
- ❌ 官网无法访问
- ❌ 个人玩具项目 (非生产就绪)

---

## 📊 质量评分体系

### 评分维度 (满分 100)

```
GitHub 健康度 (40 分)
├── Stars 数量 (20 分) - log10(stars) * 4
├── Forks 数量 (10 分) - 社区参与度
└── 更新频率 (10 分) - <30天:10分, <90天:5分

产品完整度 (30 分)
├── 有独立官网 (10 分)
├── 有文档 (10 分) - README > 1000字
├── 有示例 (5 分)
└── 有社区 (5 分) - Discussions/Discord

流行度 (20 分)
├── Product Hunt Votes (10 分)
└── 社交媒体提及 (10 分)

技术质量 (10 分)
├── 有测试 (3 分)
├── 有 CI/CD (3 分)
└── 开源协议 (4 分)
```

### 准入门槛

```typescript
const MIN_QUALITY_THRESHOLD = {
  githubStars: 500,           // 至少 500 stars
  githubUpdatedDays: 90,      // 90 天内有更新
  productHuntVotes: 100,      // PH 至少 100 votes
  hasDocumentation: true,     // 必须有文档
  hasWorkingWebsite: true,    // 官网必须可访问
  qualityScore: 60            // 总分至少 60
};
```

---

## 🎯 智能分类逻辑

### 问题：关键词分类的局限

旧方法：
```
if (description.includes('image')) return 'image';
// 误判: "text-to-image" → image ✅
// 误判: "image processing library" → image ❌ (应该是 code)
```

### 新方法：功能意图分析

```typescript
function categorizeByFunction(tool) {
  const { topics, description, readme } = tool;
  
  // 使用 GitHub Topics (更权威)
  const topicSignals = {
    'chatbot': 'chat',
    ' conversational-ai': 'chat',
    'image-generation': 'image',
    'stable-diffusion': 'image',
    'code-assistant': 'code',
    'developer-tools': 'code'
  };
  
  // 排除法避免误判
  const categoryRules = [
    {
      category: 'chat',
      mustHave: ['chatbot', 'conversational'],
      mustNotHave: ['image generation', 'video generation'],
      confidence: 0.8
    }
  ];
  
  // 置信度评分
  return categoryWithHighestConfidence();
}
```

---

## 🔄 挖掘工作流程

### 每日挖掘流程

```
06:00 AM - 从 GitHub Trending 发现新项目
         ↓
06:30 AM - 质量评分和筛选 (Score >= 60)
         ↓
07:00 AM - 验证可用性 (官网检查)
         ↓
07:30 AM - 人工审核候选名单 (Top 10)
         ↓
08:00 AM - 入库并更新 Trending Score
```

### 每周深度挖掘

```
Sunday 06:00 AM - 全量扫描 7 个权威来源
                ↓
Sunday 08:00 AM - 交叉验证 (同一工具多来源出现)
                ↓
Sunday 10:00 AM - 生成周报 (新发现 + 趋势分析)
```

---

## 🛠️ 实现脚本

### 核心脚本

| 脚本 | 功能 | 输出 |
|------|------|------|
| `serious-tool-mining.ts` | 从权威来源挖掘 | `data/serious-mined-tools.json` |
| `quality-scorer.ts` | 质量评分 | 筛选后的高质量工具 |
| `availability-checker.ts` | 可用性验证 | 可访问性报告 |
| `category-classifier.ts` | 智能分类 | 精确分类结果 |

### 运行命令

```bash
# 严肃挖掘 (质量优先)
npx tsx scripts/serious-tool-mining.ts

# 查看挖掘结果
cat data/serious-mined-tools.json | jq '.[] | {name, qualityScore, category}'

# 导入高质量工具 (Score >= 60)
npx tsx scripts/import-quality-tools.ts --min-score=60
```

---

## 📈 成功指标

### 数量指标
- **每日新发现**: 5-10 个高质量工具
- **入库率**: < 20% (严格筛选)
- **误判率**: < 5% (精准分类)

### 质量指标
- **平均 Quality Score**: > 70
- **官网可访问率**: > 95%
- **近期更新率**: > 80%

### 业务指标
- **用户停留时间**: 增加 50%
- **点击率**: 增加 30%
- **回访率**: 增加 40%

---

## 🚫 排除清单 (Red Flags)

### 自动排除
- [ ] Stars < 500
- [ ] 6个月无更新
- [ ] 无 README 或 < 500字
- [ ] 官网无法访问
- [ ] Forks = 0 (缺乏社区参与)

### 人工审核排除
- [ ] 个人玩具项目
- [ ] 重复造轮子 (无创新)
- [ ] 文档缺失/混乱
- [ ] 无实际用户案例

---

## 🎯 执行计划

### Phase 1: 基础挖掘 (Week 1-2)
- [ ] 实现 GitHub Trending 挖掘
- [ ] 建立质量评分体系
- [ ] 运行第一批挖掘 (目标: 100 个高质量工具)

### Phase 2: 多源整合 (Week 3-4)
- [ ] 接入 Product Hunt API
- [ ] 接入 Hacker News 监控
- [ ] 交叉验证机制

### Phase 3: 自动化 (Week 5-6)
- [ ] 每日自动挖掘 Cron
- [ ] 可用性自动检测
- [ ] 质量监控看板

### Phase 4: 优化迭代 (Ongoing)
- [ ] 基于用户反馈调整评分权重
- [ ] A/B 测试分类准确性
- [ ] 持续优化挖掘算法

---

## 💡 关键原则

1. **宁可错过，不可放过** - 宁可少收录一个，也不收录低质量工具
2. **多源验证** - 单一来源的发现需要至少一个其他来源交叉验证
3. **用户视角** - 从"这个工具能帮到用户吗"出发，而非"这个工具有多少 stars"
4. **持续更新** - 挖掘不是一次性任务，是持续的质量监控

---

*最后更新: 2026-03-08*  
*策略制定: 严肃挖掘模式*

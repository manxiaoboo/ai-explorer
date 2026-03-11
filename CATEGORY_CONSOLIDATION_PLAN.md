# 分类精简方案

## 📊 现状分析

- **当前分类数**: 29个
- **总工具数**: 50个
- **空分类**: 9个
- **单工具分类**: 7个
- **问题**: 分类过多，粒度太细，分布不均

---

## 🎯 精简目标

将29个分类精简为 **10-12个核心分类**

---

## 📋 新分类体系

### 1. 🤖 AI Agents & Automation (AI代理与自动化)
**slug**: `ai-agents`
**包含原分类**: 
- AI Agents
- Automation
- NoCode (部分)

**典型工具**: Manus, MindStudio, Taskade, PagerGPT, Atoms

**归类规则**: 
- 关键词: agent, automation, workflow, bot, auto
- 功能: 自动化任务、代理执行、工作流

---

### 2. 🎨 Image & Design (图像与设计)
**slug**: `image-design`
**包含原分类**:
- Generative Art
- Image Editing
- Design (合并)

**典型工具**: ThumbnailCreator, AI Baby Generator, Sketch To, ShortPixel

**归类规则**:
- 关键词: image, photo, design, art, generate, edit, thumbnail
- 功能: 图像生成、编辑、设计

---

### 3. 🎬 Video Creation (视频创作)
**slug**: `video-creation`
**包含原分类**:
- Video Generation
- Generative Video
- Text-to-Video
- Video Editing

**典型工具**: Funy AI, Kling AI, HeyGen, Klap, OpusClip, CloneViral

**归类规则**:
- 关键词: video, generation, editing, clip, short
- 功能: 视频生成、编辑、剪辑

---

### 4. 💬 Chat & Assistants (聊天与助手)
**slug**: `chat-assistants`
**包含原分类**:
- Chat
- 部分 AI Agents (聊天型)

**典型工具**: chatbox, NextChat, cherry-studio, openclaw

**归类规则**:
- 关键词: chat, assistant, bot, conversation
- 功能: 对话、聊天、个人助手

---

### 5. 💻 Developer Tools (开发者工具)
**slug**: `developer-tools`
**包含原分类**:
- Code

**典型工具**: AutoGPT, langflow, dbeaver, system-prompts-and-models-of-ai-tools

**归类规则**:
- 关键词: code, dev, git, api, database, programming
- 功能: 编程辅助、代码生成、开发工具

---

### 6. ✍️ Content Creation (内容创作)
**slug**: `content-creation`
**包含原分类**:
- Writing
- Social Media
- Marketing (部分)

**典型工具**: PostWizard AI, Dropmagic, Syllaby, Humanize AI Text

**归类规则**:
- 关键词: write, content, social, post, marketing, copy
- 功能: 内容生成、社媒管理、营销文案

---

### 7. 📊 Productivity & Business (生产力与商业)
**slug**: `productivity-business`
**包含原分类**:
- Productivity
- Business Intelligence
- Presentation Maker
- 部分 NoCode

**典型工具**: Atomic Mail, Opal44, FocuSee, Decktopus, BASE44

**归类规则**:
- 关键词: productivity, business, presentation, email, meeting
- 功能: 办公效率、商业分析、演示文稿

---

### 8. 🎓 Education & Learning (教育与学习)
**slug**: `education-learning`
**包含原分类**:
- Education
- Recruitment (招聘本质也是教育/评估)

**典型工具**: AI Flashcard Maker, Lesson Plan Generator, Nora AI, TryOpenClaw

**归类规则**:
- 关键词: education, learn, course, study, teach, interview
- 功能: 教育辅助、学习工具、面试准备

---

### 9. 🔍 Search & Research (搜索与研究)
**slug**: `search-research`
**包含原分类**:
- Search
- AI Detection

**典型工具**: LocalBanana, AI Detector

**归类规则**:
- 关键词: search, research, detect, find, discovery
- 功能: 搜索增强、内容检测、研究工具

---

### 10. 🏥 Specialized Industries (专业行业)
**slug**: `specialized-industries`
**包含原分类**:
- Health Tech
- 其他小众行业分类

**典型工具**: Visual Field Test

**归类规则**:
- 关键词: health, medical, legal, finance, specific industry
- 功能: 特定行业的AI应用

---

### 11. 🎁 Special Offers (特别优惠)
**slug**: `special-offers`
**包含原分类**:
- Lifetime Deal

**典型工具**: Syllaby (已移到Video Creation)

**归类规则**:
- 关键词: deal, lifetime, offer, discount
- 注意: 这是按商业模式分类，不是功能分类

---

## 🔄 分类映射表

| 原分类 | 新分类 | 操作 |
|--------|--------|------|
| AI Agents | AI Agents & Automation | 合并 |
| Automation | AI Agents & Automation | 合并 |
| NoCode | AI Agents & Automation / Productivity | 拆分 |
| Generative Art | Image & Design | 合并 |
| Image Editing | Image & Design | 合并 |
| Design | Image & Design | 合并 |
| Video Generation | Video Creation | 合并 |
| Generative Video | Video Creation | 合并 |
| Text-to-Video | Video Creation | 合并 |
| Video Editing | Video Creation | 合并 |
| Chat | Chat & Assistants | 保留 |
| Code | Developer Tools | 重命名 |
| Writing | Content Creation | 合并 |
| Social Media | Content Creation | 合并 |
| Marketing | Content Creation / Productivity | 拆分 |
| Productivity | Productivity & Business | 合并 |
| Business Intelligence | Productivity & Business | 合并 |
| Presentation Maker | Productivity & Business | 合并 |
| Education | Education & Learning | 合并 |
| Recruitment | Education & Learning | 合并 |
| Search | Search & Research | 合并 |
| AI Detection | Search & Research | 合并 |
| Health Tech | Specialized Industries | 合并 |
| Lifetime Deal | Special Offers | 保留（特殊） |
| Audio | （删除或保留空） | 待补充 |
| Data | （删除或保留空） | 待补充 |
| Image | （删除） | 冗余 |
| Other | （删除） | 无意义 |
| Video | （删除） | 冗余 |

---

## 🤖 自动归类算法

### 规则引擎

```typescript
// 分类判定规则（按优先级）
const categoryRules = [
  {
    category: 'ai-agents',
    keywords: ['agent', 'automation', 'automate', 'workflow', 'bot', 'no-code', 'nocode'],
    priority: 1
  },
  {
    category: 'video-creation',
    keywords: ['video', 'generation', 'editing', 'clip', 'short', 'reel', 'tiktok'],
    priority: 1
  },
  {
    category: 'image-design',
    keywords: ['image', 'photo', 'design', 'art', 'generate', 'edit', 'thumbnail', 'logo'],
    priority: 1
  },
  {
    category: 'chat-assistants',
    keywords: ['chat', 'assistant', 'companion', 'conversation', 'talk'],
    priority: 2
  },
  {
    category: 'developer-tools',
    keywords: ['code', 'developer', 'programming', 'database', 'api', 'github', 'git'],
    priority: 1
  },
  {
    category: 'content-creation',
    keywords: ['write', 'writing', 'content', 'social', 'post', 'marketing', 'copy', 'blog'],
    priority: 2
  },
  {
    category: 'productivity-business',
    keywords: ['productivity', 'business', 'presentation', 'email', 'meeting', 'slide'],
    priority: 2
  },
  {
    category: 'education-learning',
    keywords: ['education', 'learn', 'course', 'study', 'teach', 'interview', 'exam'],
    priority: 2
  },
  {
    category: 'search-research',
    keywords: ['search', 'research', 'detect', 'find', 'discovery', 'analyze'],
    priority: 3
  },
  {
    category: 'specialized-industries',
    keywords: ['health', 'medical', 'legal', 'finance', 'law'],
    priority: 3
  }
];

// 归类函数
function categorizeTool(name: string, description: string, originalCategory: string): string {
  const text = (name + ' ' + description).toLowerCase();
  
  // 按优先级匹配关键词
  for (const rule of categoryRules.sort((a, b) => a.priority - b.priority)) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      return rule.category;
    }
  }
  
  // 默认分类映射
  const defaultMapping: Record<string, string> = {
    'ai-agents': 'ai-agents',
    'automation': 'ai-agents',
    'video-generation': 'video-creation',
    'generative-video': 'video-creation',
    'text-to-video': 'video-creation',
    'video-editing': 'video-creation',
    'generative-art': 'image-design',
    'image-editing': 'image-design',
    'code': 'developer-tools',
    'education': 'education-learning',
    'recruitment': 'education-learning',
    'productivity': 'productivity-business',
  };
  
  return defaultMapping[originalCategory] || 'other';
}
```

---

## 📊 预期效果

| 指标 | 之前 | 之后 | 改善 |
|------|------|------|------|
| 分类数量 | 29 | 11 | ↓62% |
| 空分类 | 9 | 0 | ↓100% |
| 平均工具数/分类 | 1.7 | 4.5 | ↑165% |
| 单工具分类 | 7 | 0 | ↓100% |

---

## ✅ 实施可行性

### 能做到：✅

1. **分类精简** - 完全可行
   - 删除空分类
   - 合并相似分类
   - 更新工具分类关联

2. **自动归类** - 完全可行
   - 基于关键词匹配
   - 基于描述语义分析
   - 基于原始分类映射

3. **数据迁移** - 完全可行
   - 批量更新数据库
   - 保留原有分类映射关系
   - 可回滚

### 技术实现：

```typescript
// 1. 创建新分类（如果不存在）
// 2. 迁移工具到新分类
// 3. 删除旧空分类
// 4. 在抓取脚本中集成自动归类
```

---

## 🚀 实施步骤

1. **备份数据**
2. **创建新分类**
3. **批量迁移工具**
4. **更新抓取脚本**
5. **删除旧分类**
6. **测试验证**

需要实施吗？我可以立即执行！

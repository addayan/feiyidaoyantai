# 架构设计文档

## 系统概述

非遗影像工坊采用前后端分离架构，前端为纯静态 SPA 应用，后端为 Express 代理服务器。前端通过 Hash 路由支持离线双击打开，后端负责代理 AI API 请求并保护 API Key。

## 架构图

```
┌─────────────────────────────────────────────────────────┐
│                      浏览器端                            │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  首页    │  │ 开始创作  │  │ AI导演台  │  │ 案例库  │ │
│  │  Home    │  │  Create  │  │ Director │  │  Cases  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                      │                                   │
│              ┌───────┴────────┐                          │
│              │  API 层        │                          │
│              │  src/api/ai.ts │                          │
│              └───────┬────────┘                          │
│                      │                                   │
│              ┌───────┴────────┐                          │
│              │  State 层      │                          │
│              │ projectStore   │                          │
│              │  localStorage  │                          │
│              └────────────────┘                          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (fetch)
                       ▼
┌──────────────────────────────────────────────────────────┐
│              Express 后端 (端口 3001)                    │
│                                                          │
│  ┌────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐  │
│  │ health │ │ generate │ │regenerate │ │   optimize   │  │
│  │  路由  │ │   路由   │ │   路由    │ │     路由     │  │
│  └────────┘ └────┬─────┘ └─────┬─────┘ └──────┬───────┘  │
│                │              │              │           │
│         ┌──────┴──────────────┴──────────────┴────┐      │
│         │            AI Prompt 模板层             │      │
│         │  generate-storyboard / regenerate-* /  │      │
│         │  optimize-shot / optimize-prompt       │      │
│         └──────────────────┬─────────────────────┘      │
│                            │                            │
│         ┌──────────────────┴─────────────────────┐      │
│         │              工具函数层                 │      │
│         │  json.ts   normalize.ts   safety.ts    │      │
│         │  score.ts  config.ts                    │      │
│         └──────────────────┬─────────────────────┘      │
│                            │                            │
│                    callArkAPI()                          │
└────────────────────────────┼───────────────────────────┘
                             │ HTTPS
                             ▼
┌──────────────────────────────────────────────────────────┐
│              AI 模型服务 (外部)                           │
│                                                          │
│   DeepSeek Chat API    或    火山方舟 API                │
│   api.deepseek.com         ark.cn-beijing.volces.com     │
│   /chat/completions        /api/v3/chat/completions      │
└──────────────────────────────────────────────────────────┘
```

## 前端架构

### 路由设计

使用 React Router v6 的 Hash 路由模式（`HashRouter`），确保构建产物可通过 `file://` 协议直接打开：

```
#/              → Home         首页
#/create        → Create       开始创作
#/director/:id  → Director     AI 导演台（核心页面）
#/cases         → Cases        案例库
#/projects      → MyProjects   我的项目
#/roadmap       → TechRoadmap  技术路线图
#/*             → NotFound     404 页面
```

### 组件层级

```
App.tsx
├── Navbar（全局导航）
├── <Routes>
│   ├── Home
│   │   ├── HeroBackground（Canvas 粒子动画）
│   │   └── CaseCard × 4（案例入口卡片）
│   ├── Create
│   │   └── GenerationOverlay（生成进度遮罩）
│   ├── Director（核心页面）
│   │   ├── 左侧 Sticky 导航（8 模块锚点）
│   │   ├── IntersectionObserver（滚动高亮）
│   │   ├── 故事 / 角色 / 场景 / 分镜 / 声音 / 文化检查 / 参赛说明 / 发布文案
│   │   └── GenerationOverlay（AI 操作进度）
│   ├── Cases
│   │   └── CaseCard × 4
│   ├── MyProjects
│   │   └── EmptyState（空状态）
│   ├── TechRoadmap
│   └── NotFound
```

### 状态管理

不使用 Redux 或 Zustand，采用 localStorage 直接持久化 + 自定义 store 封装：

- **存储键**：`heritage-studio-projects`
- **数据结构**：`Project[]`
- **核心方法**：`getAllProjects()` / `getProject(id)` / `saveProject()` / `deleteProject()` / `storeAddGenerationRecord()`
- **兼容策略**：V2.0.1 项目无 `generationMeta` / `generationHistory` 字段时自动兼容，不报错

### AI API 封装

`src/api/ai.ts` 封装了 6 个前端 API 函数，统一使用 fetch + AbortController：

```
checkHealth()              → GET  /api/health
generateStoryboard(req)    → POST /api/generate-storyboard
regenerateSection(req)     → POST /api/regenerate-section
regenerateShot(req)        → POST /api/regenerate-shot
optimizeShot(req)          → POST /api/optimize-shot
optimizePrompt(req)        → POST /api/optimize-prompt
```

API_BASE 动态获取：`${window.location.protocol}//${window.location.hostname}:3001/api`

## 后端架构

### 请求处理流水线

```
请求进入 → CORS 中间件 → JSON 解析 → 路由匹配
  → 参数校验 → 构建 Prompt → callArkAPI()
  → safeJSONParse() → normalizeGeneratedResult()
  → 返回 JSON 响应
```

### AI API 调用

`callArkAPI(messages, options)` 封装 OpenAI 兼容的 `/chat/completions` 接口调用：

- 请求头携带 `Authorization: Bearer ${ARK_API_KEY}`
- 支持 `temperature`、`max_tokens`、`response_format` 参数
- 120 秒超时控制
- 错误分类：`AI_TIMEOUT` / `AI_NOT_CONFIGURED` / `AI_INVALID_RESPONSE` / `AI_REQUEST_FAILED`

### JSON 修复链

AI 返回的文本可能不规范，后端通过四步修复：

```
extractJSON(text)        → 提取 JSON 片段（去除前后非 JSON 文字）
removeCodeFence(json)    → 去除 Markdown 代码围栏（```json ... ```）
tryRepairTruncatedJSON  → 修复截断的 JSON（补全括号和引号）
JSON.parse()             → 标准解析
```

全部封装在 `safeJSONParse(text)` 中，返回 `{ data, error }`。

### 数据标准化

`normalizeGeneratedResult(raw, request)` 确保输出结构完整：

- shots 强制补齐到 8 个或截取前 8 个
- 镜头编号统一为 `shot-1` 到 `shot-8`
- 缺失字段用默认值填充
- `generatabilityScore` 重新计算并限制在 0-100
- `submissionNote` 8 个字段确保完整
- `soundDesign` 4 个字段确保完整
- `socialPosts` 的 douyin 和 xiaohongshu 确保存在

### 可生成性评分

`calculateGeneratabilityScore(shot)` 基于 8 个维度扣分（满分 100）：

| 维度 | 扣分上限 | 检测逻辑 |
|------|---------|---------|
| 主体数量 | -15 | 统计提示词中的主体词和量词 |
| 人物数量 | -15 | 统计人物相关词 |
| 动作数量 | -15 | 统计动作动词 |
| 运镜复杂度 | -10 | 检测环绕、航拍等复杂运镜 |
| 环境变化 | -10 | 首帧/尾帧环境词一致性 |
| 提示词长度 | -10 | 过短或过长扣分 |
| 冲突动作 | -12 | 检测"一边…一边""同时"等 |
| 同时事件 | -12 | 检测"同时""与此同时""平行" |

## 数据流

### AI 生成流程

```
1. 用户在 Create 页选择非遗类型、填写主题、选择风格
2. 点击「AI 真实生成」→ 调用 generateStoryboard()
3. 前端显示 GenerationOverlay（进度条 + 6 阶段状态）
4. 后端构建 prompt → 调用 AI 模型 → 等待响应（30-90s）
5. 后端 safeJSONParse → normalizeGeneratedResult
6. 返回标准化 JSON → 前端创建 Project → 保存到 localStorage
7. 跳转到 /director/:id → 展示完整方案
```

### 单镜头重新生成流程

```
1. 用户在 Director 页点击镜头的「重新生成」按钮
2. 调用 regenerateShot({ project, shotIndex, instruction? })
3. 后端构建 prompt（含前后镜头上下文）→ 调用 AI 模型
4. safeJSONParse → 标准化单个镜头
5. 前端用 data.shots.map() 更新目标镜头（避免 stale closure）
6. 自动保存到 localStorage
7. 记录到 generationHistory
```

## 安全设计

### API Key 隔离

```
.env 文件（仅服务端）  →  config.ts 读取  →  callArkAPI() 使用
                                                ↓
                                    前端永远无法访问 Key
```

- `.env` 在 `.gitignore` 中
- `.env.example` 仅含占位符
- 前端代码中无任何 Key 引用
- dist 构建产物中无 Key
- Git 历史中无 Key
- 服务端日志不输出 Authorization 头
- 错误响应不返回完整堆栈

### 内容安全规则

`server/utils/safety.ts` 根据非遗类型应用特定规则：

- 禁止虚构官方传承人姓名
- 角色必须标注为"虚构创作角色"
- 工艺描述需基于公开资料
- 建议注明真实资料来源

## 技术决策记录

### ADR-001：使用 Hash 路由而非 Browser 路由

- **背景**：构建产物需要支持 `file://` 协议双击打开
- **决策**：使用 `HashRouter` 而非 `BrowserRouter`
- **影响**：URL 中带 `#`，但支持离线打开，无需服务器配置

### ADR-002：后端代理而非直连 AI API

- **背景**：前端直连 AI API 会暴露 API Key
- **决策**：增加 Express 后端代理层，Key 仅存于服务端 `.env`
- **影响**：AI 模式需同时运行前后端，但 Key 安全性得到保障

### ADR-003：localStorage 而非数据库

- **背景**：项目需要快速验证，无后端数据库基础设施
- **决策**：使用 localStorage 持久化项目数据
- **影响**：数据仅存于浏览器本地，未来需迁移至云端存储

### ADR-004：JSON 修复链而非强制 JSON 格式

- **背景**：AI 模型返回的 JSON 可能不规范（带代码围栏、截断、多余文字）
- **决策**：构建四步修复链 `extractJSON → removeCodeFence → tryRepairTruncatedJSON → JSON.parse`
- **影响**：提高了容错性，减少了因 AI 返回格式问题导致的失败

### ADR-005：8-shot 强制对齐

- **背景**：AI 可能返回 6 个或 10 个镜头，但产品要求固定 8 个
- **决策**：`normalizeGeneratedResult()` 中强制补齐到 8 个或截取前 8 个
- **影响**：保证了产品一致性，补齐的镜头使用默认模板

## 性能考量

- 完整分镜生成耗时 30-90 秒（取决于 AI 模型响应速度）
- 单模块/单镜头操作耗时 1-10 秒
- 前端同一时间只允许一个 AI 操作（禁用其他 AI 按钮）
- 前端使用 AbortController 支持超时取消
- 后端 120 秒超时控制

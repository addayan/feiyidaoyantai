# 变更日志

所有重要变更均记录在此文件中。版本号遵循语义化版本规范 `MAJOR.MINOR.PATCH`。

## [V2.1.0] — 2026-07-28

### 新增

- **真实 AI 文本生成**：接入 DeepSeek Chat / 火山方舟大模型，通过 Express 后端代理（端口 3001），API Key 仅存在于服务端 `.env`
- **AI 配置检测**：`GET /api/health` 返回模型配置状态，前端根据状态动态启用/禁用 AI 按钮
- **整体分镜生成**：`POST /api/generate-storyboard` 一次性生成 8 大模块完整方案（故事、角色、场景、8 镜头、声音设计、文化检查、参赛说明、发布文案）
- **单模块重新生成**：`POST /api/regenerate-section` 支持 7 种模块独立重新生成，不影响其他模块
- **单镜头重新生成**：`POST /api/regenerate-shot` 重新生成指定镜头，自动考虑前后镜头衔接
- **镜头 AI 优化**：`POST /api/optimize-shot` 支持 9 种优化方向（cinematic / emotion / camera / heritage / generatability / simplify / seedream / seedance / custom）
- **提示词单独优化**：`POST /api/optimize-prompt` 对首帧/尾帧/视频提示词进行单独优化
- **JSON 修复链**：`extractJSON → removeCodeFence → tryRepairTruncatedJSON → safeJSONParse`，处理 AI 返回的不规范格式
- **数据标准化**：`normalizeGeneratedResult()` 强制 shots 补齐/截取到 8 个，缺失字段自动填充
- **可生成性评分**：`calculateGeneratabilityScore()` 基于 8 维度启发式评分（0-100）
- **内容安全规则**：非遗类型特定安全规则，防止虚构官方传承人等不当内容
- **生成历史记录**：`generationHistory` 字段记录每次 AI 操作
- **旧项目兼容迁移**：V2.0.1 项目自动兼容，无 `generationMeta` 字段时自动补齐
- **前端 AbortController**：120 秒超时控制，支持取消请求
- **并发启动**：`npm run dev:all` 使用 concurrently 同时启动前后端

### 修复

- `handleRegenerateShot` / `handleOptimizeShot` / `handleOptimizePrompt` 的 stale closure 问题，改为 `data.shots.map()` 创建新数组
- `addGenerationRecord` 绕过 projectStore 直接操作 localStorage 的问题，新增 `storeAddGenerationRecord` 方法
- `api/ai.ts` 中 `API_BASE` 硬编码为 `localhost:3001` 的问题，改为动态获取 `window.location.hostname`

### 安全

- `.env` 加入 `.gitignore`
- `.env.example` 仅含占位符值
- 前端代码、dist 构建产物、Git 历史中均无 API Key
- 服务端日志不输出 Authorization 头
- 错误响应不返回完整堆栈信息

## [V2.0.1] — 2026-07-23

### 修复

- `GenerationOverlay` 硬编码"2 个场景"问题，改为从 `completionStats` prop 动态计算角色数、场景数、镜头数、提示词数

### 新增

- 项目重命名：Enter 键确认，Esc 键取消
- 项目删除：二次确认弹窗，防止误删
- 禁用按钮统一样式：`opacity: 0.5 + cursor: not-allowed`，hover 提示"需要配置火山方舟 API"
- 404 页面：功能性"返回首页"和"返回上页"按钮
- 继续创作路由：从"我的项目"页直接跳转到导演台

### 验收

6 项交互验收全部通过：
1. 重命名持久化
2. 删除二次确认
3. Enter/Esc 快捷键
4. 禁用按钮样式统一
5. 继续创作路由
6. 404 按钮功能

## [V2.0.0] — 2026-07 初

### 新增

- **首页**：Hero 背景（真实傩面图片）+ Canvas 粒子动画 + 案例入口卡片
- **开始创作页**：非遗类型 chip 选择 + 创意主题输入 + 用途/时长/风格选择 + 快速体验模式
- **AI 导演台**：左侧 sticky 导航（8 模块锚点 + IntersectionObserver 滚动高亮）+ 右侧长页面
- **分镜导演台**：8 个镜头卡片，含画面描述 + 首帧/尾帧/视频提示词 + 可生成性评分
- **提示词展开/收起**：单镜头展开显示三合一提示词 + 单条复制 + 全部复制
- **参赛说明**：8 字段完整展示 + 复制完整参赛说明
- **在线编辑**：所有文本字段支持实时编辑，自动保存到 localStorage
- **Markdown 导出**：完整项目文档一键下载
- **案例库**：4 个内置案例（傩戏《丑面》、铜梁龙《火龙入夜》、蜀绣《一针入画》、木版年画《门神醒来》）
- **我的项目**：项目列表 + 重命名 + 删除 + 继续创作
- **404 页面**：友好的错误提示 + 返回按钮
- **快速体验模式**：`mockGenerator` 模拟生成，无需 API Key
- **localStorage 持久化**：键名 `heritage-studio-projects`，自动保存项目数据
- **构建配置**：Vite `base: "./"` 支持离线双击打开

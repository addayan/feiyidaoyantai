# 非遗影像工坊 2.2｜AI 非遗短片导演台

**在线体验：https://feiyi.hao1234.top/**

## 项目简介

非遗影像工坊是一款面向 AIGC 创作者、非遗爱好者与短视频创作者的 AI 辅助创作工具。用户只需输入非遗类型、创意主题与视觉风格，即可借助真实 AI 大模型在数十秒内生成一部完整的非遗短片方案，包含创意故事、角色设定、场景设定、8 个分镜镜头、声音设计、文化表达检查与参赛说明。

## 版本：V2.2.0

### 新增功能

- **在线零配置使用**：基于 Cloudflare Pages + Workers 部署，直接访问在线地址即可体验，无需配置任何环境
- **项目导入导出**：支持以 JSON 格式导入导出项目，方便备份与跨设备迁移
- **错误边界保护**：引入 ErrorBoundary，避免局部异常导致整个应用白屏崩溃
- **真实 AI 文本生成**：接入 agnes-2.0-flash 大模型，实现真实 AI 驱动的分镜方案生成
- **AI 配置检测**：前端自动检测后端 AI 模型配置状态，动态启用/禁用 AI 功能按钮
- **单模块重新生成**：支持对故事、角色、场景、声音设计、参赛说明、发布文案等模块单独重新生成
- **单镜头重新生成**：支持对单个镜头进行 AI 重新生成，自动考虑前后镜头衔接
- **镜头 AI 优化**：支持 9 种优化方向（增强电影感、增强可生成性、适配 Seedance 等）
- **提示词单独优化**：支持对首帧/尾帧/视频提示词进行单独优化
- **AI 操作自动保存**：所有 AI 操作结果自动保存到 localStorage
- **生成历史记录**：记录每次 AI 操作的完整历史
- **旧项目兼容迁移**：V2.0.1 项目自动兼容，无报错

### 明确说明

- **快速体验无需 API**：快速体验模式使用本地 mock 数据，无需配置任何 API Key
- **AI 真实生成需要本地 .env**：AI 模式需要在项目根目录创建 `.env` 文件配置 API Key（在线版已由 Cloudflare Worker 代理，无需自行配置）
- **Seedream 和 Seedance 尚未真实调用**：当前版本仅使用文本大模型生成方案，图像/视频生成 API 尚未接入
- **API Key 不进入前端和 Git**：API Key 仅存在于后端 `.env` 文件或 Cloudflare Worker 环境变量中，已加入 `.gitignore`

## 技术栈

- **前端**：React 18 + TypeScript + Vite 6 + React Router v6
- **后端**：Express 4 + Node.js（代理 AI API 请求）
- **AI 模型**：agnes-2.0-flash
- **状态管理**：localStorage 本地持久化
- **UI 样式**：CSS 变量 + 自定义主题（深蓝黑底 + 金/青点缀）
- **部署**：Cloudflare Pages（前端）+ Cloudflare Workers（API 代理）
- **API 安全**：API Key 存储在 Cloudflare Worker 环境变量中，前端不接触任何密钥

## 本地运行

> 在线体验推荐直接访问 https://feiyi.hao1234.top/，无需任何配置即可使用全部功能。

### 快速体验（无需 API）

```bash
npm install
npm run dev
```

访问 http://localhost:5173，选择"快速体验"模式即可体验完整创作流程。

### AI 真实生成模式

1. 在项目根目录创建 `.env` 文件：

```
ARK_API_KEY=your-api-key
ARK_MODEL_ID=agnes-2.0-flash
ARK_BASE_URL=https://apihub.agnes-ai.com/v1
ARK_TIMEOUT_MS=120000
```

2. 启动前端和后端：

```bash
npm install
npm run dev:all
```

3. 访问 http://localhost:5173，选择"AI 真实生成"模式。

## 构建方法

```bash
npm run build
```

构建产物输出到 `dist/` 目录。可直接双击 `dist/index.html` 打开。

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 + 模型配置状态 |
| `/api/generate-storyboard` | POST | 生成完整分镜方案 |
| `/api/regenerate-section` | POST | 重新生成指定模块 |
| `/api/regenerate-shot` | POST | 重新生成单个镜头 |
| `/api/optimize-shot` | POST | 优化单个镜头 |
| `/api/optimize-prompt` | POST | 优化单个提示词字段 |

## API Key 安全说明

- 所有 API Key 仅通过 `.env` 文件或 Cloudflare Worker 环境变量管理
- `.env` 已加入 `.gitignore`，不会提交到 Git
- `.env.example` 仅包含占位符值
- 前端代码中绝不暴露任何 Key
- 服务端日志不输出 Authorization 头
- 错误响应不返回完整堆栈信息

## 后续开发计划

1. **Seedream 图像生成**：接入 Seedream API 生成首帧/尾帧图片
2. **Seedance 视频生成**：接入 Seedance API 生成视频预览
3. **更多非遗类型**：扩展至皮影戏、景泰蓝、苏绣、古琴等 20+ 非遗类型
4. **团队协作**：支持项目分享与多人协作编辑

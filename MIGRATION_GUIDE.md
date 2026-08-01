# 跨设备迁移指南

本文档说明如何在另一台电脑上恢复并继续开发本项目。

## 一、前置条件

新电脑需要安装以下工具：

| 工具 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | >= 18.x | JavaScript 运行时 |
| npm | >= 9.x | 包管理器 |
| Git | >= 2.x | 版本控制 |
| VS Code / TRAE IDE | 最新版 | 代码编辑器 |
| Cloudflare 账号 | — | 部署平台 |

## 二、获取代码

### 方式一：从 GitHub 克隆（推荐）

```bash
git clone https://github.com/addayan/feiyidaoyantai.git
cd feiyidaoyantai
npm install
```

### 方式二：从源码 zip 恢复

1. 解压 `heritage-workshop-v2.2.0-source.zip`
2. 进入项目目录
3. 运行 `npm install`

## 三、环境变量配置

项目中有两套环境变量，分别用于本地开发和云端部署：

### 本地开发（可选）

在项目根目录创建 `.env` 文件（**不要提交到 Git**）：

```
ARK_API_KEY=your-api-key
ARK_MODEL_ID=agnes-2.0-flash
ARK_BASE_URL=https://apihub.agnes-ai.com/v1
ARK_TIMEOUT_MS=120000
```

> 如果没有 API Key，仍然可以使用"快速体验"模式（本地 mock 数据）。

### 云端部署（Cloudflare）

以下环境变量已配置在 Cloudflare Worker 中，**不需要在新电脑上重新配置**：

| 变量名 | 值 | 存储位置 |
|--------|-----|---------|
| ARK_API_KEY | (你的 API Key) | Cloudflare Worker 环境变量 |
| ARK_MODEL_ID | agnes-2.0-flash | Cloudflare Worker 环境变量 |
| ARK_BASE_URL | https://apihub.agnes-ai.com/v1 | Cloudflare Worker 环境变量 |
| ARK_TIMEOUT_MS | 120000 | Cloudflare Worker 环境变量 |

## 四、启动开发

```bash
# 仅前端（快速体验模式，无需 API）
npm run dev

# 前端 + 后端（AI 真实生成模式，需要 .env 文件）
npm run dev:all
```

访问 http://localhost:5173

## 五、构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

## 六、部署到 Cloudflare

### 部署前端

```bash
npx wrangler pages deploy dist --project-name=feiyi --branch=main
```

### 部署 Worker（更新 AI 代理）

```bash
npx wrangler deploy worker/feiyi-ai-worker.js --name feiyi-ai-api
```

### Cloudflare 账号信息

| 项目 | 值 |
|------|-----|
| Account ID | d47a86113683cf607f4ad2044c8b5027 |
| Pages 项目名 | feiyi |
| Worker 名称 | feiyi-ai-api |
| 自定义域名 | feiyi.hao1234.top |

## 七、项目结构

```
feiyidaoyantai/
├── src/                    # 前端源码
│   ├── api/               # AI API 调用
│   ├── components/         # React 组件
│   ├── data/              # 案例数据、风格预设
│   ├── hooks/             # 自定义 Hooks
│   ├── pages/             # 页面组件
│   ├── store/             # 状态管理
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── server/                # 本地后端（Express）
├── worker/                # Cloudflare Worker 代码
├── functions/             # Cloudflare Pages Functions（备用）
├── public/                # 静态文件
├── release/               # 版本发布文件
├── index.html             # 入口 HTML
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 依赖配置
```

## 八、关键注意事项

1. **API Key 安全**：API Key 只能存在于 `.env` 文件或 Cloudflare Worker 环境变量中，绝不提交到 Git
2. **`.gitignore` 已配置**：`.env`、`node_modules`、`dist`、`.wrangler` 均被忽略
3. **线上地址**：https://feiyi.hao1234.top/ （始终可用）
4. **GitHub 仓库**：https://github.com/addayan/feiyidaoyantai

## 九、常见问题

### Q: 新电脑上 `npm run dev` 报错？
A: 先运行 `npm install` 安装依赖。

### Q: AI 生成不工作？
A: 本地开发需要在 `.env` 文件中配置 API Key；线上已由 Cloudflare Worker 代理，无需配置。

### Q: 如何更新线上版本？
A: `npm run build` → `npx wrangler pages deploy dist --project-name=feiyi --branch=main`

### Q: 如何更新 Worker 代码？
A: 修改 `worker/feiyi-ai-worker.js` → `npx wrangler deploy worker/feiyi-ai-worker.js --name feiyi-ai-api`

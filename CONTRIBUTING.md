# 贡献指南

感谢你对非遗影像工坊项目的关注。本文档说明如何参与开发。

## 环境准备

### 必需环境

- Node.js >= 18（推荐 20 LTS）
- npm >= 9
- Git

### 克隆与安装

```bash
git clone <repository-url>
cd feiyidaoyantai-main
npm install
```

### 快速体验模式（无需 API）

```bash
npm run dev
# 访问 http://localhost:5173
```

### AI 真实生成模式

1. 复制环境变量模板：

```bash
cp .env.example .env
```

2. 编辑 `.env`，填入真实 API Key：

```
ARK_API_KEY=your-api-key-here
ARK_MODEL_ID=deepseek-chat
ARK_BASE_URL=https://api.deepseek.com
ARK_TIMEOUT_MS=120000
```

3. 启动前后端：

```bash
npm run dev:all
# 前端 http://localhost:5173 + 后端 http://localhost:3001
```

## 项目结构

```
feiyidaoyantai-main/
├── src/                前端源码
│   ├── api/            AI API 封装
│   ├── components/     通用组件
│   ├── data/           mock 数据与案例
│   ├── hooks/          自定义 Hooks
│   ├── pages/          页面组件
│   ├── store/          状态管理（localStorage）
│   ├── types/          类型定义
│   └── utils/          工具函数
├── server/             后端源码
│   ├── prompts/        AI Prompt 模板
│   ├── routes/         API 路由
│   └── utils/          工具函数（JSON 修复、标准化、评分、安全）
├── docs/               项目文档
├── release/            发布目录
├── public/             静态资源
└── dist/               构建产物（gitignore）
```

## 代码规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `GenerationOverlay.tsx` |
| 工具函数 | camelCase | `safeJSONParse()` |
| 类型接口 | PascalCase | `ProjectData` |
| 常量 | UPPER_SNAKE | `STORAGE_KEY` |
| CSS 类名 | kebab-case | `.hero-section` |

### TypeScript 规范

- 所有文件使用严格模式（`strict: true`）
- 函数参数和返回值需标注类型
- 禁止使用 `any`（后端 `normalize.ts` 中的 `any` 为遗留问题，待 V2.2.0 修复）
- 使用 `interface` 定义对象类型，`type` 定义联合类型

### Commit 规范

```
feat: 添加 Seedream 图像生成功能
fix: 修复 Director 页 stale closure 问题
chore: 升级 Vite 至 6.4
docs: 更新 API 接口文档
```

### 版本规范

```
V{major}.{minor}.{patch}｜{description}

示例：
V2.0.0｜快速体验版
V2.0.1｜体验收口版
V2.1.0｜真实 AI 体验验收版
```

## 硬性约束

以下约束不可违反，PR 如违反将被拒绝：

1. **API Key 安全**：Key 绝不出现在前端代码、dist 构建产物、Git 历史、日志、README、测试文件中
2. **`.env` 不提交**：`.env` 在 `.gitignore` 中，`.env.example` 仅含占位符
3. **统计数据动态计算**：项目统计（角色数、场景数、镜头数、提示词数）必须从项目数据动态计算，不得硬编码
4. **禁用按钮样式统一**：`opacity: 0.5 + cursor: not-allowed`，hover 提示"需要配置火山方舟 API"或"未配置 AI 模型"
5. **项目重命名**：Enter 键确认，Esc 键取消
6. **项目删除**：需二次确认
7. **404 页面**：必须包含功能性的"返回首页"和"返回上页"按钮
8. **版本保护**：不得覆盖已发布版本的文件、commit、tag、ZIP 包

## 开发流程

### 1. 创建分支

```bash
git checkout -b feat/your-feature-name
```

### 2. 开发与测试

```bash
# 前端开发
npm run dev

# 前后端联合开发
npm run dev:all

# TypeScript 编译检查
npm run build

# 后端编译检查
npm run build:server
```

### 3. 提交前检查

- [ ] TypeScript 编译零错误
- [ ] Vite 构建通过
- [ ] 无 API Key 泄露（检查前端代码和 dist 产物）
- [ ] 新功能在浏览器中手动验证
- [ ] 旧项目数据兼容（如有数据结构变更）
- [ ] `.env` 未被提交

### 4. 提交 PR

PR 描述需包含：
- 变更内容摘要
- 测试方式
- 是否影响现有功能
- 是否涉及数据结构变更

## 测试要点

### 快速体验模式测试

1. 首页正常打开，Hero 背景加载
2. 开始创作页表单交互正常
3. 快速体验能生成完整项目
4. 导演台 8 模块完整展示
5. 复制、编辑、导出功能正常
6. 我的项目列表正常
7. 4 个案例可打开

### AI 真实生成模式测试

1. 后端 `/api/health` 返回 `modelConfigured: true`
2. 前端 AI 按钮可点击（非禁用状态）
3. 整体生成成功，8 个镜头完整
4. 单模块重新生成成功
5. 单镜头重新生成成功
6. 镜头 AI 优化成功
7. 提示词优化成功
8. AI 操作后自动保存
9. 刷新页面后数据保留

### 安全测试

```bash
# 检查前端代码中无 API Key
grep -r "sk-" src/
grep -r "ARK_API_KEY" src/

# 检查 dist 中无 API Key
grep -r "sk-" dist/

# 检查 Git 历史中无 API Key
git log -p | grep "sk-"
```

以上命令应无输出结果。

## 常见问题

### Q: AI 生成时报错 "AI_NOT_CONFIGURED"

后端未配置 `.env` 文件或 `ARK_API_KEY` 为空。请创建 `.env` 并填入有效 Key。

### Q: 前端 AI 按钮灰色不可点击

后端 `/api/health` 返回 `modelConfigured: false`。检查后端是否运行、`.env` 是否配置正确。

### Q: AI 生成超时

完整分镜方案生成可能需要 30-90 秒。如果超时，检查网络连接或增加 `ARK_TIMEOUT_MS` 值。

### Q: 构建后双击 index.html 白屏

确认 `vite.config.ts` 中 `base: "./"` 已设置。构建产物应放在同一目录下，不可修改文件相对路径。

### Q: localStorage 数据丢失

检查浏览器是否清除了站点数据。localStorage 数据与域名绑定，换端口或域名需要重新创建项目。

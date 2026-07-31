# 非遗影像工坊 开发文档

> 版本：V2.2.0 BY 阿岩  
> 日期：2026-07-31  
> 项目：AI 非遗短片导演台  
> 赛事：TRAE AI 创造力大赛

---

## 一、版本概览

### V2.2.0 核心改动

| 改动类型 | 内容 | 版本增量 |
|---------|------|---------|
| 大改动 (+0.1) | Cloudflare Pages Functions 无服务器后端 | 2.1 → 2.2 |
| 大改动 (+0.1) | 镜头参数智能补齐系统（前后端双引擎） | 2.1 → 2.2 |
| 大改动 (+0.1) | 项目导出/导入功能（JSON 格式） | 2.1 → 2.2 |
| 小改动 (+0.01) | 镜头参数可编辑下拉框 | 2.20 → 2.21 |
| 小改动 (+0.01) | API 密钥安全存储（环境变量） | 2.21 → 2.22 |
| 小改动 (+0.01) | 版本号统一更新 + BY 阿岩署名 | 2.22 → 2.2.0 |

### 版本号规则
- 大改动 +0.1（新功能模块、架构变更）
- 小改动 +0.01（UI 优化、Bug 修复、配置调整）
- 格式：V{major}.{minor}.{patch} BY 阿岩

---

## 二、架构变更

### 2.1 旧架构（V2.1 及之前）
```
前端 (Vite/React)  →  Express 后端 (localhost:3001)  →  火山方舟 API
```
- 后端需要独立部署和运行
- API 密钥存储在 .env 文件中
- 无法直接部署到静态托管平台

### 2.2 新架构（V2.2.0）
```
前端 (Vite/React)  →  Cloudflare Pages Functions (/api/*)  →  DeepSeek API
```
- 前端与 API 同源部署（Cloudflare Pages）
- API 密钥存储在 Cloudflare 环境变量中（secret_text 加密）
- 零服务器维护，自动扩缩容

### 2.3 关键决策

| 决策点 | 选择 | 原因 |
|-------|------|------|
| API 代理方案 | Cloudflare Pages Functions | 同源部署、零服务器、环境变量加密 |
| API 服务商 | DeepSeek (deepseek-chat) | 稳定性高、性价比好、已有凭证 |
| 参数补齐策略 | 前后端双引擎 | 确保新项目（后端）和旧项目（前端）都能获得完整参数 |
| 项目导出格式 | JSON（含元数据） | 完整保留所有数据、可重新导入 |
| 版本署名 | BY 阿岩 | 创作者标识，统一显示在 Navbar 和 Footer |

---

## 三、功能详解

### 3.1 Cloudflare Pages Functions

创建了 6 个无服务器 API 端点，替代 Express 后端：

```
functions/
├── _lib/
│   └── ark.ts                    # 共享 API 客户端模块
├── api/
│   ├── health.ts                 # 健康检查 GET /api/health
│   ├── generate-storyboard.ts    # 生成分镜 POST /api/generate-storyboard
│   ├── regenerate-section.ts     # 重生段落 POST /api/regenerate-section
│   ├── regenerate-shot.ts        # 重生镜头 POST /api/regenerate-shot
│   ├── optimize-shot.ts          # 优化镜头 POST /api/optimize-shot
│   └── optimize-prompt.ts       # 优化提示词 POST /api/optimize-prompt
└── tsconfig.json                 # Cloudflare Workers TypeScript 配置
```

**安全设计：**
- API 密钥通过 `env.ARK_API_KEY` 读取，不出现在前端代码中
- 密钥存储为 `secret_text` 类型，Cloudflare 加密保存
- 前端通过同源 `/api/*` 路径访问，无需跨域配置
- 生产环境 `config.js` 中 `window.__API_BASE__ = ''`（使用相对路径）

### 3.2 镜头参数智能补齐系统

**7 个镜头参数自动填充：**

| 参数 | 字段名 | 智能默认值逻辑 |
|------|--------|--------------|
| 构图 | `composition` | 根据景别映射（特写→中心构图、中景→三分法、远景→引导线构图） |
| 光效 | `lighting` | 根据描述关键词匹配（黄昏→暖光、逆光→逆光、室内→柔光） |
| 机位角度 | `cameraAngle` | 根据景别和运镜推断（特写+平视→平视、远景+俯拍→俯视） |
| 景深 | `depthOfField` | 根据景别判断（特写→浅景深、全景→深景深） |
| 速度 | `speed` | 根据运镜方式判断（固定→正常、推拉→正常、跟拍→正常） |
| 情绪 | `mood` | 根据描述关键词匹配（温暖→温馨、紧张→紧张、宁静→宁静） |
| 转场 | `transition` | 根据镜头位置判断（首镜→淡入、末镜→淡出、中间→硬切） |

**双引擎实现：**
- **后端**（`server/utils/normalize.ts`）：AI 生成后自动补齐
- **前端**（`Director.tsx`）：加载旧项目时自动补齐

### 3.3 镜头参数可编辑界面

- 点击参数值即可编辑
- 下拉框选择标准参数值
- `onBlur` 自动保存，`onChange` 实时更新
- 空值显示虚线下划线提示可编辑

### 3.4 项目导出/导入功能

**导出（JSON）：**
- 完整项目数据（分镜、角色、场景、提示词等）
- 包含导出元数据（应用名、版本、时间、导出者）
- 文件名格式：`{项目名}-非遗影像工坊.json`

**导入（JSON）：**
- 支持从文件选择导入
- 自动生成新 ID，避免冲突
- 导入后自动跳转到导演台
- 在 Director 页面和 MyProjects 页面均可导入

---

## 四、文件变更清单

### 新增文件
| 文件路径 | 用途 |
|---------|------|
| `functions/_lib/ark.ts` | Cloudflare Pages 共享 API 客户端 |
| `functions/api/health.ts` | 健康检查端点 |
| `functions/api/generate-storyboard.ts` | 分镜生成端点 |
| `functions/api/regenerate-section.ts` | 段落重生端点 |
| `functions/api/regenerate-shot.ts` | 镜头重生端点 |
| `functions/api/optimize-shot.ts` | 镜头优化端点 |
| `functions/api/optimize-prompt.ts` | 提示词优化端点 |
| `functions/tsconfig.json` | Functions TypeScript 配置 |
| `DEVELOPMENT.md` | 本开发文档 |

### 修改文件
| 文件路径 | 改动内容 |
|---------|---------|
| `src/pages/Director.tsx` | 添加 `fillMissingShotDetailsClient`、镜头参数可编辑下拉框、导出/导入 JSON 功能 |
| `src/pages/MyProjects.tsx` | 添加导入项目 JSON 功能和 toast 提示 |
| `server/utils/normalize.ts` | 添加 `fillMissingShotDetails` 函数（7 参数智能补齐） |
| `server/routes/optimize.ts` | 集成 `fillMissingShotDetails` 到优化流程 |
| `src/components/Navbar.tsx` | 版本号更新为 `V2.2 BY 阿岩` |
| `src/components/Footer.tsx` | 版本号更新为 `V2.2.0 BY 阿岩` |
| `public/config.js` | 生产环境 API 路径改为同源 `/api` |
| `package.json` | 版本号更新为 `2.2.0` |

---

## 五、部署流程

### 5.1 环境变量配置

通过 Cloudflare API 设置 Pages 环境变量：

| 变量名 | 类型 | 值 |
|--------|------|-----|
| `ARK_API_KEY` | secret_text | (加密存储，不显示) |
| `ARK_MODEL_ID` | plain_text | `deepseek-chat` |
| `ARK_BASE_URL` | plain_text | `https://api.deepseek.com` |
| `ARK_TIMEOUT_MS` | plain_text | `120000` |

### 5.2 构建与部署

```bash
# 1. 安装依赖
npm install

# 2. 构建前端
npm run build

# 3. 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=feiyi --branch=main
```

### 5.3 域名配置

| 域名 | 类型 | 状态 |
|------|------|------|
| `feiyi-4zu.pages.dev` | Cloudflare 默认域名 | ✅ 已生效 |
| `feiyi.hao1234.top` | 自定义域名 (CNAME) | ✅ 已绑定 |

---

## 六、安全措施

1. **API 密钥隔离**：密钥仅存在于 Cloudflare 环境变量中，前端代码、dist 构建、Git 历史中均无密钥
2. **.env 保护**：`.env` 在 `.gitignore` 中，`.env.example` 只含空值和文档
3. **同源请求**：前端与 API 同域名，避免 CORS 和跨域安全问题
4. **密钥加密存储**：API Key 使用 `secret_text` 类型，Cloudflare 加密保存
5. **输入验证**：导入 JSON 时验证格式和数据完整性

---

## 七、版本历史

| 版本 | 日期 | 主要内容 |
|------|------|---------|
| V2.0.1 | 2026-07-28 | 体验收口版（分镜卡片视觉升级） |
| V2.1.0 | 2026-07-29 | 导演台体验优化（拖拽排序、批量操作、镜头对比） |
| V2.2.0 | 2026-07-31 | 安全 API 集成 + 镜头参数补齐 + 项目导出导入 |

---

## 八、技术栈

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | 前端框架 |
| Vite 6 | 构建工具 |
| Cloudflare Pages | 静态托管 + 无服务器函数 |
| Cloudflare Pages Functions | API 代理（替代 Express） |
| DeepSeek API | AI 大模型（分镜生成、优化） |
| @dnd-kit | 拖拽排序（V2.1.0 引入） |
| localStorage | 项目数据本地存储 |

---

## 九、后续规划

- [ ] 镜头对比面板（侧边并排参数展示）
- [ ] 更多非遗类型支持
- [ ] 内置案例库扩充
- [ ] 团队协作功能
- [ ] 云端项目同步

---

*本文档由 阿岩 维护，最后更新于 2026-07-31*

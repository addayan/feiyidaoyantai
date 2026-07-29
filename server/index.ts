// ===== 非遗影像工坊 AI 后端入口 =====

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { getSafeModelId } from './config';

// 路由
import healthRouter from './routes/health';
import generateRouter from './routes/generate';
import regenerateRouter from './routes/regenerate';
import optimizeRouter from './routes/optimize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 前端构建产物目录
const STATIC_DIR = path.join(__dirname, '..', 'dist');
const hasFrontendBuild = fs.existsSync(path.join(STATIC_DIR, 'index.html'));

// ===== 中间件 =====
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 请求日志中间件（只记录路径、状态码、耗时、模型 ID）
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  _res.on('finish', () => {
    if (req.path.startsWith('/api/')) {
      const elapsed = Date.now() - start;
      console.log(`${req.method} ${req.path} ${_res.statusCode} ${elapsed}ms model=${getSafeModelId()}`);
    }
  });
  next();
});

// ===== 注册 API 路由 =====
app.use(healthRouter);
app.use(generateRouter);
app.use(regenerateRouter);
app.use(optimizeRouter);

// ===== API 404 处理（仅 /api/ 路径） =====
app.use('/api', (_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: '接口不存在', retryable: false } });
});

// ===== 静态文件服务 + SPA 回退（生产模式） =====
if (hasFrontendBuild) {
  app.use(express.static(STATIC_DIR));
  // SPA 回退：非 API 路由返回 index.html（支持 React Router）
  app.get('*', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(STATIC_DIR, 'index.html'));
  });
} else {
  console.log('[非遗影像工坊] 未检测到前端构建产物 (dist/)，仅运行 API 服务');
  console.log('[非遗影像工坊] 开发模式请使用: npm run dev:all');
}

// ===== 全局错误处理 =====
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误', retryable: true } });
});

// ===== 启动 =====
app.listen(PORT, () => {
  console.log(`[非遗影像工坊] 启动成功，监听端口 ${PORT}`);
  console.log(`[非遗影像工坊] 访问地址: http://localhost:${PORT}`);
  console.log(`[非遗影像工坊] API Health: http://localhost:${PORT}/api/health`);
  console.log(`[非遗影像工坊] 模型: ${getSafeModelId()}`);
  if (hasFrontendBuild) {
    console.log(`[非遗影像工坊] 前端静态文件: ${STATIC_DIR}`);
  }
});

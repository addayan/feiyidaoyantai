// ===== 非遗影像工坊 AI 后端入口 =====
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getSafeModelId } from './config';
// 路由
import healthRouter from './routes/health';
import generateRouter from './routes/generate';
import regenerateRouter from './routes/regenerate';
import optimizeRouter from './routes/optimize';
const app = express();
const PORT = process.env.PORT || 3001;
// ===== 中间件 =====
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// 请求日志中间件（只记录路径、状态码、耗时、模型 ID）
app.use((req, _res, next) => {
    const start = Date.now();
    _res.on('finish', () => {
        // 只对 API 路由打印日志（路由内部也会打印更详细的日志）
        if (req.path.startsWith('/api/')) {
            const elapsed = Date.now() - start;
            console.log(`${req.method} ${req.path} ${_res.statusCode} ${elapsed}ms model=${getSafeModelId()}`);
        }
    });
    next();
});
// ===== 注册路由 =====
app.use(healthRouter);
app.use(generateRouter);
app.use(regenerateRouter);
app.use(optimizeRouter);
// ===== 404 处理 =====
app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: '接口不存在', retryable: false } });
});
// ===== 全局错误处理 =====
app.use((err, _req, res, _next) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误', retryable: true } });
});
// ===== 启动 =====
app.listen(PORT, () => {
    console.log(`[非遗影像工坊 AI 后端] 启动成功，监听端口 ${PORT}`);
    console.log(`[非遗影像工坊 AI 后端] Health: http://localhost:${PORT}/api/health`);
    console.log(`[非遗影像工坊 AI 后端] 模型: ${getSafeModelId()}`);
});

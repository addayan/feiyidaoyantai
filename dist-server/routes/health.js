// ===== Health 路由 =====
import { Router } from 'express';
import { isModelConfigured, getSafeModelId } from '../config';
const router = Router();
router.get('/api/health', (_req, res) => {
    const body = {
        ok: true,
        service: '非遗影像工坊 AI 后端',
        modelConfigured: isModelConfigured,
        modelId: getSafeModelId(),
    };
    res.json(body);
});
export default router;

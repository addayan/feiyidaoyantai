// ===== Health 路由 =====

import { Router, Request, Response } from 'express';
import { isModelConfigured, getSafeModelId } from '../config';
import type { HealthResponse } from '../types';

const router = Router();

router.get('/api/health', (_req: Request, res: Response) => {
  const body: HealthResponse = {
    ok: true,
    service: '非遗影像工坊 AI 后端',
    modelConfigured: isModelConfigured,
    modelId: getSafeModelId(),
  };
  res.json(body);
});

export default router;

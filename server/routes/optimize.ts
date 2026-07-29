// ===== 优化路由 =====

import { Router, Request, Response } from 'express';
import { isModelConfigured, getSafeModelId } from '../config';
import { safeJSONParse } from '../utils/json';
import { calculateGeneratabilityScore } from '../utils/score';
import { buildOptimizeShotPrompt } from '../prompts/optimize-shot';
import { buildOptimizePromptFieldPrompt } from '../prompts/optimize-prompt';
import { callArkAPI, aiErrorResponse } from './generate';
import { validateShotDetailFields } from '../utils/normalize';

const router = Router();

// --- 优化镜头 ---
router.post('/api/optimize-shot', async (req: Request, res: Response) => {
  const startTime = Date.now();

  if (!isModelConfigured) {
    console.log(`POST /api/optimize-shot 503 ${Date.now() - startTime}ms model=(未配置)`);
    return aiErrorResponse(res, 'AI_NOT_CONFIGURED', 'AI 模型未配置', false, 503);
  }

  const { project, shotIndex, optimizeType, customInstruction } = req.body;
  if (project === undefined || project === null || shotIndex === undefined || shotIndex < 0 || !optimizeType) {
    return res.status(400).json({ error: { code: 'AI_REQUEST_FAILED', message: '缺少必要参数：project, shotIndex, optimizeType', retryable: false } });
  }

  const prompt = buildOptimizeShotPrompt(project, shotIndex, optimizeType, customInstruction);

  try {
    const rawText = await callArkAPI(prompt);
    const { data: parsed, error: parseError } = safeJSONParse(rawText);

    if (!parsed) {
      console.log(`POST /api/optimize-shot 500 ${Date.now() - startTime}ms model=${getSafeModelId()} parse_error`);
      return aiErrorResponse(res, 'AI_INVALID_RESPONSE', `AI 返回内容无法解析: ${parseError}`, true, 500);
    }

    // 确保镜头 id 正确
    parsed.id = `shot-${shotIndex + 1}`;

    // 校验分镜细节字段（V2.1.0 新增）
    validateShotDetailFields(parsed);

    // 重新计算可生成性评分
    const { score, checks } = calculateGeneratabilityScore(parsed);
    parsed.generatabilityScore = score;
    parsed.generatabilityChecks = checks.map(c => ({
      label: c.label,
      status: c.status === 'warning' ? 'warn' : 'pass',
      detail: c.detail,
    }));

    console.log(`POST /api/optimize-shot 200 ${Date.now() - startTime}ms model=${getSafeModelId()}`);
    res.json({ shotIndex, shot: parsed });
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      console.log(`POST /api/optimize-shot 504 ${elapsed}ms model=${getSafeModelId()} timeout`);
      return aiErrorResponse(res, 'AI_TIMEOUT', `AI 请求超时`, true, 504);
    }
    const code = err.code || 'AI_REQUEST_FAILED';
    console.log(`POST /api/optimize-shot 500 ${elapsed}ms model=${getSafeModelId()} error=${code}`);
    return aiErrorResponse(res, code, err.message || '未知错误', err.retryable ?? false, 500);
  }
});

// --- 优化单个提示词字段 ---
router.post('/api/optimize-prompt', async (req: Request, res: Response) => {
  const startTime = Date.now();

  if (!isModelConfigured) {
    console.log(`POST /api/optimize-prompt 503 ${Date.now() - startTime}ms model=(未配置)`);
    return aiErrorResponse(res, 'AI_NOT_CONFIGURED', 'AI 模型未配置', false, 503);
  }

  const { project, shotIndex, promptField, optimizeType, customInstruction } = req.body;
  if (project === undefined || project === null || shotIndex === undefined || shotIndex < 0 || !promptField || !optimizeType) {
    return res.status(400).json({ error: { code: 'AI_REQUEST_FAILED', message: '缺少必要参数：project, shotIndex, promptField, optimizeType', retryable: false } });
  }

  const prompt = buildOptimizePromptFieldPrompt(project, shotIndex, promptField, optimizeType, customInstruction);

  try {
    const rawText = await callArkAPI(prompt);

    // 提示词优化返回的是纯文本，直接返回
    // 去除可能的前后空白和引号
    let optimizedPrompt = rawText.trim();
    if (optimizedPrompt.startsWith('"') && optimizedPrompt.endsWith('"')) {
      optimizedPrompt = optimizedPrompt.slice(1, -1);
    }

    console.log(`POST /api/optimize-prompt 200 ${Date.now() - startTime}ms model=${getSafeModelId()}`);
    res.json({
      shotIndex,
      promptField,
      optimizedPrompt,
    });
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      console.log(`POST /api/optimize-prompt 504 ${elapsed}ms model=${getSafeModelId()} timeout`);
      return aiErrorResponse(res, 'AI_TIMEOUT', `AI 请求超时`, true, 504);
    }
    const code = err.code || 'AI_REQUEST_FAILED';
    console.log(`POST /api/optimize-prompt 500 ${elapsed}ms model=${getSafeModelId()} error=${code}`);
    return aiErrorResponse(res, code, err.message || '未知错误', err.retryable ?? false, 500);
  }
});

export default router;

// ===== 重新生成路由 =====
import { Router } from 'express';
import { isModelConfigured, getSafeModelId } from '../config';
import { safeJSONParse } from '../utils/json';
import { calculateGeneratabilityScore } from '../utils/score';
import { buildSafetyRules } from '../utils/safety';
import { buildRegenerateSectionPrompt } from '../prompts/regenerate-section';
import { buildRegenerateShotPrompt } from '../prompts/regenerate-shot';
import { callArkAPI, aiErrorResponse } from './generate';
const router = Router();
// --- 重新生成模块 ---
router.post('/api/regenerate-section', async (req, res) => {
    const startTime = Date.now();
    if (!isModelConfigured) {
        console.log(`POST /api/regenerate-section 503 ${Date.now() - startTime}ms model=(未配置)`);
        return aiErrorResponse(res, 'AI_NOT_CONFIGURED', 'AI 模型未配置', false, 503);
    }
    const { project, sectionType, instruction } = req.body;
    if (!project || !sectionType) {
        return res.status(400).json({ error: { code: 'AI_REQUEST_FAILED', message: '缺少必要参数：project, sectionType', retryable: false } });
    }
    const safetyRules = buildSafetyRules();
    const prompt = buildRegenerateSectionPrompt(project, sectionType, safetyRules, instruction);
    try {
        const rawText = await callArkAPI(prompt);
        const { data: parsed, error: parseError } = safeJSONParse(rawText);
        if (!parsed) {
            console.log(`POST /api/regenerate-section 500 ${Date.now() - startTime}ms model=${getSafeModelId()} parse_error`);
            return aiErrorResponse(res, 'AI_INVALID_RESPONSE', `AI 返回内容无法解析: ${parseError}`, true, 500);
        }
        console.log(`POST /api/regenerate-section 200 ${Date.now() - startTime}ms model=${getSafeModelId()}`);
        res.json({ sectionType, data: parsed });
    }
    catch (err) {
        const elapsed = Date.now() - startTime;
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            console.log(`POST /api/regenerate-section 504 ${elapsed}ms model=${getSafeModelId()} timeout`);
            return aiErrorResponse(res, 'AI_TIMEOUT', `AI 请求超时`, true, 504);
        }
        const code = err.code || 'AI_REQUEST_FAILED';
        console.log(`POST /api/regenerate-section 500 ${elapsed}ms model=${getSafeModelId()} error=${code}`);
        return aiErrorResponse(res, code, err.message || '未知错误', err.retryable ?? false, 500);
    }
});
// --- 重新生成镜头 ---
router.post('/api/regenerate-shot', async (req, res) => {
    const startTime = Date.now();
    if (!isModelConfigured) {
        console.log(`POST /api/regenerate-shot 503 ${Date.now() - startTime}ms model=(未配置)`);
        return aiErrorResponse(res, 'AI_NOT_CONFIGURED', 'AI 模型未配置', false, 503);
    }
    const { project, shotIndex, instruction } = req.body;
    if (project === undefined || project === null || shotIndex === undefined || shotIndex < 0) {
        return res.status(400).json({ error: { code: 'AI_REQUEST_FAILED', message: '缺少必要参数：project, shotIndex', retryable: false } });
    }
    const safetyRules = buildSafetyRules();
    const prompt = buildRegenerateShotPrompt(project, shotIndex, safetyRules, instruction);
    try {
        const rawText = await callArkAPI(prompt);
        const { data: parsed, error: parseError } = safeJSONParse(rawText);
        if (!parsed) {
            console.log(`POST /api/regenerate-shot 500 ${Date.now() - startTime}ms model=${getSafeModelId()} parse_error`);
            return aiErrorResponse(res, 'AI_INVALID_RESPONSE', `AI 返回内容无法解析: ${parseError}`, true, 500);
        }
        parsed.id = `shot-${shotIndex + 1}`;
        const { score, checks } = calculateGeneratabilityScore(parsed);
        parsed.generatabilityScore = score;
        parsed.generatabilityChecks = checks.map(c => ({
            label: c.label,
            status: c.status === 'warning' ? 'warn' : 'pass',
            detail: c.detail,
        }));
        console.log(`POST /api/regenerate-shot 200 ${Date.now() - startTime}ms model=${getSafeModelId()}`);
        res.json({ shotIndex, shot: parsed });
    }
    catch (err) {
        const elapsed = Date.now() - startTime;
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            console.log(`POST /api/regenerate-shot 504 ${elapsed}ms model=${getSafeModelId()} timeout`);
            return aiErrorResponse(res, 'AI_TIMEOUT', `AI 请求超时`, true, 504);
        }
        const code = err.code || 'AI_REQUEST_FAILED';
        console.log(`POST /api/regenerate-shot 500 ${elapsed}ms model=${getSafeModelId()} error=${code}`);
        return aiErrorResponse(res, code, err.message || '未知错误', err.retryable ?? false, 500);
    }
});
export default router;

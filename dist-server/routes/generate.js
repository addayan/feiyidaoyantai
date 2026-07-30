// ===== 生成分镜方案路由 =====
import { Router } from 'express';
import { config, isModelConfigured, getSafeModelId } from '../config';
import { safeJSONParse } from '../utils/json';
import { normalizeGeneratedResult } from '../utils/normalize';
import { buildSafetyRules } from '../utils/safety';
import { buildGeneratePrompt } from '../prompts/generate-storyboard';
const router = Router();
/** 创建 AIError 响应 */
export function aiErrorResponse(res, code, message, retryable, status) {
    const err = { code, message, retryable };
    return res.status(status).json({ error: err });
}
/** 调用火山方舟 API */
export async function callArkAPI(prompt) {
    const response = await fetch(`${config.arkBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.arkApiKey}`,
        },
        body: JSON.stringify({
            model: config.arkModelId,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 16000,
        }),
        signal: AbortSignal.timeout(config.arkTimeoutMs),
    });
    if (!response.ok) {
        if (response.status === 429) {
            throw Object.assign(new Error('AI 请求被限流'), { code: 'AI_RATE_LIMITED', retryable: true });
        }
        throw Object.assign(new Error(`AI 请求失败: HTTP ${response.status}`), { code: 'AI_REQUEST_FAILED', retryable: response.status >= 500 });
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
        throw Object.assign(new Error('AI 响应格式异常：无有效内容'), { code: 'AI_INVALID_RESPONSE', retryable: true });
    }
    return content;
}
router.post('/api/generate-storyboard', async (req, res) => {
    const startTime = Date.now();
    if (!isModelConfigured) {
        console.log(`POST /api/generate-storyboard 503 ${Date.now() - startTime}ms model=(未配置)`);
        return aiErrorResponse(res, 'AI_NOT_CONFIGURED', 'AI 模型未配置，请在服务端设置 ARK_API_KEY 和 ARK_MODEL_ID 环境变量', false, 503);
    }
    const { heritageType, topic, purpose, duration, style } = req.body;
    if (!heritageType || !topic || !purpose || !duration || !style) {
        return res.status(400).json({ error: { code: 'AI_REQUEST_FAILED', message: '缺少必要参数', retryable: false } });
    }
    const request = { heritageType, topic, purpose, duration, style };
    const safetyRules = buildSafetyRules();
    const prompt = buildGeneratePrompt(request, safetyRules);
    try {
        const rawText = await callArkAPI(prompt);
        const { data: parsed, error: parseError } = safeJSONParse(rawText);
        if (!parsed) {
            console.log(`POST /api/generate-storyboard 500 ${Date.now() - startTime}ms model=${getSafeModelId()} parse_error`);
            return aiErrorResponse(res, 'AI_INVALID_RESPONSE', `AI 返回内容无法解析为 JSON: ${parseError}`, true, 500);
        }
        const normalized = normalizeGeneratedResult(parsed, request);
        console.log(`POST /api/generate-storyboard 200 ${Date.now() - startTime}ms model=${getSafeModelId()}`);
        res.json(normalized);
    }
    catch (err) {
        const elapsed = Date.now() - startTime;
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            console.log(`POST /api/generate-storyboard 504 ${elapsed}ms model=${getSafeModelId()} timeout`);
            return aiErrorResponse(res, 'AI_TIMEOUT', `AI 请求超时（${config.arkTimeoutMs}ms）`, true, 504);
        }
        const code = err.code || 'AI_REQUEST_FAILED';
        const retryable = err.retryable ?? false;
        console.log(`POST /api/generate-storyboard 500 ${elapsed}ms model=${getSafeModelId()} error=${code}`);
        return aiErrorResponse(res, code, err.message || '未知错误', retryable, 500);
    }
});
export default router;

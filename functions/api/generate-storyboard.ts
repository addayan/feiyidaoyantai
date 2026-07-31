import { buildGeneratePrompt } from '../../server/prompts/generate-storyboard';
import { buildSafetyRules } from '../../server/utils/safety';
import { safeJSONParse } from '../../server/utils/json';
import { normalizeGeneratedResult } from '../../server/utils/normalize';
import { callArkAPI, isModelConfigured, getSafeModelId, createErrorResponse } from '../_lib/ark';

export const onRequestPost: PagesFunction = async (context) => {
  const env = context.env as unknown as Record<string, string>;
  
  if (!isModelConfigured(env)) {
    return createErrorResponse('AI_NOT_CONFIGURED', 'AI 模型未配置，请在 Cloudflare Pages 设置 ARK_API_KEY 和 ARK_MODEL_ID 环境变量', false, 503);
  }

  try {
    const body = await context.request.json();
    const { heritageType, topic, purpose, duration, style } = body;
    if (!heritageType || !topic || !purpose || !duration || !style) {
      return createErrorResponse('AI_REQUEST_FAILED', '缺少必要参数', false, 400);
    }

    const request = { heritageType, topic, purpose, duration, style };
    const safetyRules = buildSafetyRules();
    const prompt = buildGeneratePrompt(request, safetyRules);

    const rawText = await callArkAPI(prompt, env);
    const { data: parsed, error: parseError } = safeJSONParse(rawText);
    if (!parsed) {
      return createErrorResponse('AI_INVALID_RESPONSE', `AI 返回内容无法解析为 JSON: ${parseError}`, true, 500);
    }

    const normalized = normalizeGeneratedResult(parsed, request);
    return new Response(JSON.stringify(normalized), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return createErrorResponse('AI_TIMEOUT', 'AI 请求超时', true, 504);
    }
    const code = err.code || 'AI_REQUEST_FAILED';
    return createErrorResponse(code, err.message || '未知错误', err.retryable ?? false, 500);
  }
};

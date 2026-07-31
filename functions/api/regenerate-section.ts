import { buildRegenerateSectionPrompt } from '../../server/prompts/regenerate-section';
import { buildSafetyRules } from '../../server/utils/safety';
import { safeJSONParse } from '../../server/utils/json';
import { callArkAPI, isModelConfigured, createErrorResponse } from '../_lib/ark';

export const onRequestPost: PagesFunction = async (context) => {
  const env = context.env as unknown as Record<string, string>;
  
  if (!isModelConfigured(env)) {
    return createErrorResponse('AI_NOT_CONFIGURED', 'AI 模型未配置', false, 503);
  }

  try {
    const body = await context.request.json();
    const { project, sectionType, instruction } = body;
    if (!project || !sectionType) {
      return createErrorResponse('AI_REQUEST_FAILED', '缺少必要参数：project, sectionType', false, 400);
    }

    const safetyRules = buildSafetyRules();
    const prompt = buildRegenerateSectionPrompt(project, sectionType, safetyRules, instruction);

    const rawText = await callArkAPI(prompt, env);
    const { data: parsed, error: parseError } = safeJSONParse(rawText);
    if (!parsed) {
      return createErrorResponse('AI_INVALID_RESPONSE', `AI 返回内容无法解析: ${parseError}`, true, 500);
    }

    return new Response(JSON.stringify({ sectionType, data: parsed }), {
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

import { buildRegenerateShotPrompt } from '../../server/prompts/regenerate-shot';
import { buildSafetyRules } from '../../server/utils/safety';
import { safeJSONParse } from '../../server/utils/json';
import { calculateGeneratabilityScore } from '../../server/utils/score';
import { validateShotDetailFields, fillMissingShotDetails } from '../../server/utils/normalize';
import { callArkAPI, isModelConfigured, createErrorResponse } from '../_lib/ark';

export const onRequestPost: PagesFunction = async (context) => {
  const env = context.env as unknown as Record<string, string>;
  
  if (!isModelConfigured(env)) {
    return createErrorResponse('AI_NOT_CONFIGURED', 'AI 模型未配置', false, 503);
  }

  try {
    const body = await context.request.json();
    const { project, shotIndex, instruction } = body;
    if (project === undefined || project === null || shotIndex === undefined || shotIndex < 0) {
      return createErrorResponse('AI_REQUEST_FAILED', '缺少必要参数：project, shotIndex', false, 400);
    }

    const safetyRules = buildSafetyRules();
    const prompt = buildRegenerateShotPrompt(project, shotIndex, safetyRules, instruction);

    const rawText = await callArkAPI(prompt, env);
    const { data: parsed, error: parseError } = safeJSONParse(rawText);
    if (!parsed) {
      return createErrorResponse('AI_INVALID_RESPONSE', `AI 返回内容无法解析: ${parseError}`, true, 500);
    }

    parsed.id = `shot-${shotIndex + 1}`;
    validateShotDetailFields(parsed);
    fillMissingShotDetails(parsed, shotIndex, 8);
    const { score, checks } = calculateGeneratabilityScore(parsed);
    parsed.generatabilityScore = score;
    parsed.generatabilityChecks = checks.map((c: any) => ({
      label: c.label,
      status: c.status === 'warning' ? 'warn' : 'pass',
      detail: c.detail,
    }));

    return new Response(JSON.stringify({ shotIndex, shot: parsed }), {
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

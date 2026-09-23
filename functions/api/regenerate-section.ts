import { buildRegenerateSectionPrompt } from '../../server/prompts/regenerate-section';
import { buildSafetyRules } from '../../server/utils/safety';
import { safeJSONParse } from '../../server/utils/json';
import { callArkChatAPI, createErrorResponse } from '../_lib/ark';
import { getModelConfig, isModelConfigured } from '../_lib/config';

export const onRequestPost: PagesFunction = async (context) => {
  
  const config = await getModelConfig(context);
  const chat = config.chat;
  if (!isModelConfigured(config) || !chat) {
    return createErrorResponse('AI_NOT_CONFIGURED', 'AI 模型未配置', false, 503);
  }

  try {
    const body: any = await context.request.json();
    const { project, sectionType, instruction } = body;
    if (!project || !sectionType) {
      return createErrorResponse('AI_REQUEST_FAILED', '缺少必要参数：project, sectionType', false, 400);
    }

    const safetyRules = buildSafetyRules();
    const prompt = buildRegenerateSectionPrompt(project, sectionType, safetyRules, instruction);

    const rawText = await callArkChatAPI(prompt, chat);
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

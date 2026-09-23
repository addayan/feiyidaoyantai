import { buildOptimizePromptFieldPrompt } from '../../server/prompts/optimize-prompt';
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
    const { project, shotIndex, promptField, optimizeType, customInstruction } = body;
    if (project === undefined || project === null || shotIndex === undefined || shotIndex < 0 || !promptField || !optimizeType) {
      return createErrorResponse('AI_REQUEST_FAILED', '缺少必要参数：project, shotIndex, promptField, optimizeType', false, 400);
    }

    const prompt = buildOptimizePromptFieldPrompt(project, shotIndex, promptField, optimizeType, customInstruction);

    const rawText = await callArkChatAPI(prompt, chat);
    let optimizedPrompt = rawText.trim();
    if (optimizedPrompt.startsWith('"') && optimizedPrompt.endsWith('"')) {
      optimizedPrompt = optimizedPrompt.slice(1, -1);
    }

    return new Response(JSON.stringify({ shotIndex, promptField, optimizedPrompt }), {
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

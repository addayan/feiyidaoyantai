import { buildGeneratePrompt } from '../../server/prompts/generate-storyboard';
import { buildSafetyRules } from '../../server/utils/safety';
import { safeJSONParse } from '../../server/utils/json';
import { normalizeGeneratedResult } from '../../server/utils/normalize';
import { callArkChatAPI, createErrorResponse } from '../_lib/ark';
import { getModelConfig, isModelConfigured } from '../_lib/config';
import {
  checkDedupe, checkRateLimit, acquireConcurrency, releaseConcurrency,
  getCachedResult, cacheResult, recordUsage, hashRequest,
} from '../_lib/guard';

export const onRequestPost: PagesFunction = async (context) => {
  const config = await getModelConfig(context);
  const chat = config.chat;

  if (!isModelConfigured(config) || !chat) {
    return createErrorResponse('AI_NOT_CONFIGURED', 'AI 聊天模型未配置，请在「设置」页面（/admin）填写 API Key 与模型 ID', false, 503);
  }

  const kv = (context.env as any)?.ARK_CONFIG_KV as KVNamespace | undefined;

  try {
    const body: any = await context.request.json();
    const { heritageType, topic, purpose, duration, style } = body;
    if (!heritageType || !topic || !purpose || !duration || !style) {
      return createErrorResponse('AI_REQUEST_FAILED', '缺少必要参数', false, 400);
    }

    const request = { heritageType, topic, purpose, duration, style };
    const safetyRules = buildSafetyRules();
    const prompt = buildGeneratePrompt(request, safetyRules);

    // 请求指纹（生成参数 + 模型指纹），用于去重与缓存
    const fingerprint = `${chat.modelId}|${chat.baseUrl}`;
    const reqHash = hashRequest(JSON.stringify(request), fingerprint);

    // 1. 10 秒去重
    if (!(await checkDedupe(kv, reqHash))) {
      return createErrorResponse('AI_DUPLICATE', '相同请求正在处理或刚提交过，请勿重复提交（10 秒内自动去重）', false, 429);
    }

    // 2. 主模型限速（Gemini 8 次/分钟）
    const rate = await checkRateLimit(kv, 'chat');
    if (!rate.ok) {
      return createErrorResponse(rate.code, rate.message, true, 429);
    }

    // 3. 并发控制（流程级，最大 2）
    const conc = await acquireConcurrency(kv, 'chat');
    if (!conc.ok) {
      return createErrorResponse(conc.code, conc.message, true, 503);
    }

    // 4. 结果缓存（相同请求 1 小时内直接返回）
    const cacheKey = `guard:cache:${reqHash}`;
    const cached = await getCachedResult(kv, cacheKey);
    if (cached) {
      await releaseConcurrency(kv, 'chat');
      return new Response(cached, { headers: { 'Content-Type': 'application/json' } });
    }

    try {
      // 5. 模型调用（主/备自动切换）
      const rawText = await callArkChatAPI(prompt, chat);
      const { data: parsed, error: parseError } = safeJSONParse(rawText);
      if (!parsed) {
        return createErrorResponse('AI_INVALID_RESPONSE', `AI 返回内容无法解析为 JSON: ${parseError}`, true, 500);
      }

      const normalized = normalizeGeneratedResult(parsed, request);
      const resultBody = JSON.stringify({ ...normalized, aiModel: 'chat' });

      // 6. 用量记录（聊天模型）+ 结果缓存
      await recordUsage(kv, 'chat');
      await cacheResult(kv, cacheKey, resultBody);

      return new Response(resultBody, {
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      await releaseConcurrency(kv, 'chat');
    }
  } catch (err: any) {
    // 到达 AI 层的失败也计入今日用量（KV/守卫类错误不计）
    if (err.status) await recordUsage(kv, 'chat');

    if (err.name === 'TimeoutError' || err.name === 'AbortError' || err.timedOut) {
      return createErrorResponse('AI_TIMEOUT', 'AI 请求超时', true, 504);
    }
    if (err.status === 400 || err.status === 401 || err.status === 403) {
      return createErrorResponse(err.code || 'AI_CONFIG_ERROR', `${err.message || 'AI 配置错误'}（请到「设置」页检查 API Key 与模型配置）`, false, 500);
    }
    const code = err.code || 'AI_REQUEST_FAILED';
    return createErrorResponse(code, err.message || '未知错误', err.retryable ?? false, 500);
  }
};

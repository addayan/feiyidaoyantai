import { testArkConnection } from '../../_lib/ark';
import { createErrorResponse } from '../../_lib/ark';
import { getModelConfig, PROVIDER_KINDS, ProviderKind } from '../../_lib/config';

const LABELS: Record<ProviderKind, string> = { chat: '聊天模型', image: '图片模型', video: '视频模型' };

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body: any = await context.request.json();
    const provider: ProviderKind = (PROVIDER_KINDS as string[]).includes(body.provider) ? body.provider : 'chat';
    const cfg = body.config || {};
    const current = await getModelConfig(context);
    const base = current[provider];

    // API Key / 模型留空时使用已保存配置（KV 优先，环境变量兜底）
    let apiKey = String(cfg.apiKey || '').trim() || base?.apiKey || '';
    let modelId = String(cfg.modelId || '').trim() || base?.modelId || '';
    const baseUrl = String(cfg.baseUrl || '').trim() || base?.baseUrl || '';

    if (!apiKey || !modelId) {
      return createErrorResponse('ADMIN_INVALID_INPUT', `请先填写 ${LABELS[provider]} 的 API Key 与模型 ID 再测试（留空则使用已保存配置）`, false, 400);
    }
    if (baseUrl && !/^https?:\/\/.+/.test(baseUrl)) {
      return createErrorResponse('ADMIN_INVALID_INPUT', 'Base URL 必须以 http(s):// 开头', false, 400);
    }

    const result = await testArkConnection({
      apiKey,
      modelId,
      baseUrl: baseUrl || 'https://ark.cn-beijing.volces.com/api/v3',
      timeoutMs: typeof cfg.timeoutMs === 'number' && cfg.timeoutMs > 0 ? cfg.timeoutMs : (base?.timeoutMs || 30000),
    });

    return new Response(JSON.stringify({ ...result, provider }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return createErrorResponse('ADMIN_TEST_FAILED', err.message || '测试失败', false, 500);
  }
};

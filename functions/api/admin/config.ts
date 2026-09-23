import { getModelConfig, saveModelConfig, isModelConfigured, PROVIDER_KINDS, ProviderKind } from '../../_lib/config';
import { createErrorResponse } from '../../_lib/ark';


function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

function serializeProvider(cfg: { apiKey: string; modelId: string; baseUrl: string; timeoutMs: number } | null | undefined) {
  if (!cfg) return null;
  return {
    modelId: cfg.modelId,
    baseUrl: cfg.baseUrl,
    timeoutMs: cfg.timeoutMs,
    apiKeyMasked: maskKey(cfg.apiKey),
    hasApiKey: !!cfg.apiKey,
  };
}

export const onRequestGet: PagesFunction = async (context) => {
  const env = context.env as any;
  const config = await getModelConfig(context);
  return new Response(JSON.stringify({
    ok: true,
    hasKv: !!env?.ARK_CONFIG_KV,
    source: env?.ARK_CONFIG_KV ? 'kv-or-env' : 'env',
    configured: isModelConfigured(config),
    chat: serializeProvider(config.chat),
    image: serializeProvider(config.image),
    video: serializeProvider(config.video),
    hint: 'API Key 留空表示不修改；保存时使用当前值。聊天模型用于文字生成，图片/视频模型为预留配置。',
  }), { headers: { 'Content-Type': 'application/json' } });
};

export const onRequestPost: PagesFunction = async (context) => {
  const env = context.env as any;

  try {
    const body: any = await context.request.json();
    const kv = env?.ARK_CONFIG_KV as KVNamespace | undefined;

    if (body.clear) {
      await saveModelConfig(kv, { chat: { apiKey: '', modelId: '' } });
      return new Response(JSON.stringify({ ok: true, cleared: true, message: '已清空 KV 配置，将回退使用环境变量。' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cfg = body.config || {};

    // 校验 baseUrl 合法性（防误填）
    for (const kind of PROVIDER_KINDS) {
      const x = cfg[kind];
      if (x && x.baseUrl && !/^https?:\/\/.+/.test(x.baseUrl)) {
        throw Object.assign(new Error('Base URL 必须以 http(s):// 开头'), { code: 'ADMIN_INVALID_INPUT' });
      }
    }

    const patch: Partial<Record<ProviderKind, any>> = {};
    for (const kind of PROVIDER_KINDS) {
      const x = cfg[kind];
      if (!x) continue;
      const empty = !(x.apiKey || x.modelId);
      patch[kind] = empty ? null : { apiKey: x.apiKey, modelId: x.modelId, baseUrl: x.baseUrl, timeoutMs: x.timeoutMs };
    }

    const saved = await saveModelConfig(kv, patch);

    return new Response(JSON.stringify({
      ok: true,
      message: '配置已保存并立即生效。',
      chat: serializeProvider(saved.chat),
      image: serializeProvider(saved.image),
      video: serializeProvider(saved.video),
      configured: isModelConfigured(saved),
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return createErrorResponse(err.code || 'ADMIN_SAVE_FAILED', err.message || '保存失败', false, 400);
  }
};

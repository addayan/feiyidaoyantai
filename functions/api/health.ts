import { getModelConfig, isModelConfigured, getSafeModelId } from '../_lib/config';

export const onRequestGet: PagesFunction = async (context) => {
  const config = await getModelConfig(context);
  return new Response(JSON.stringify({
    ok: true,
    service: '辽韵 AI 导演台 AI 后端 (Pages Functions)',
    modelConfigured: isModelConfigured(config),
    modelId: getSafeModelId(config),
    source: (context.env as any)?.ARK_CONFIG_KV ? 'kv-or-env' : 'env',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

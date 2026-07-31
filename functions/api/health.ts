import { isModelConfigured, getSafeModelId } from '../_lib/ark';

export const onRequestGet: PagesFunction = async (context) => {
  const env = context.env as unknown as Record<string, string>;
  return new Response(JSON.stringify({
    ok: true,
    service: '非遗影像工坊 AI 后端 (Pages Functions)',
    modelConfigured: isModelConfigured(env),
    modelId: getSafeModelId(env),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

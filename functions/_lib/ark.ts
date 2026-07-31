// 火山方舟 API 调用（V2.2.0 Pages Functions 版本）
// API Key 从 Cloudflare Pages 环境变量获取，绝不暴露在前端

export interface ArkConfig {
  apiKey: string;
  modelId: string;
  baseUrl: string;
  timeoutMs: number;
}

export function getArkConfig(env: Record<string, string>): ArkConfig {
  return {
    apiKey: env.ARK_API_KEY || '',
    modelId: env.ARK_MODEL_ID || '',
    baseUrl: env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
    timeoutMs: parseInt(env.ARK_TIMEOUT_MS || '120000', 10),
  };
}

export function isModelConfigured(env: Record<string, string>): boolean {
  const cfg = getArkConfig(env);
  return !!(cfg.apiKey && cfg.modelId);
}

export function getSafeModelId(env: Record<string, string>): string {
  return getArkConfig(env).modelId || '(未配置)';
}

export function createErrorResponse(code: string, message: string, retryable: boolean, status: number): Response {
  return new Response(JSON.stringify({ error: { code, message, retryable } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function callArkAPI(prompt: string, env: Record<string, string>): Promise<string> {
  const cfg = getArkConfig(env);
  const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.modelId,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 16000,
    }),
    signal: AbortSignal.timeout(cfg.timeoutMs),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw Object.assign(new Error('AI 请求被限流'), { code: 'AI_RATE_LIMITED', retryable: true });
    }
    throw Object.assign(new Error(`AI 请求失败: HTTP ${response.status}`), { code: 'AI_REQUEST_FAILED', retryable: response.status >= 500 });
  }

  const data: any = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw Object.assign(new Error('AI 响应格式异常：无有效内容'), { code: 'AI_INVALID_RESPONSE', retryable: true });
  }
  return content;
}

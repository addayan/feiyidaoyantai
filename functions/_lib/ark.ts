// OpenAI 兼容 API 调用（V3：聊天/图片/视频 单模型调用，无备用回退）
// API Key 来自 KV 配置（/admin 页面可配置）或环境变量，绝不暴露在前端
import type { ProviderConfig } from './config';

export interface ArkError extends Error {
  code?: string;
  status?: number;
  retryable?: boolean;
  timedOut?: boolean;
}

export function createErrorResponse(code: string, message: string, retryable: boolean, status: number): Response {
  return new Response(JSON.stringify({ error: { code, message, retryable } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeArkError(message: string, code: string, status: number | null, retryable: boolean, timedOut = false): ArkError {
  const err = new Error(message) as ArkError;
  err.code = code;
  if (status !== null) err.status = status;
  err.retryable = retryable;
  err.timedOut = timedOut;
  return err;
}

function buildRequestBody(prompt: string, cfg: ProviderConfig): Record<string, unknown> {
  const isDeepSeek = /deepseek/i.test(cfg.baseUrl);
  return {
    model: cfg.modelId,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    // DeepSeek 推理模型默认思考会超 Cloudflare 100s 限制且 16k 上限易截断；
    // 关闭思考后 0.2s 返回完整 JSON。其他模型不传该参数。
    ...(isDeepSeek ? { thinking: { type: 'disabled' } } : {}),
    max_tokens: isDeepSeek ? 32000 : 16000,
  };
}
export async function callArkAPI(prompt: string, cfg: ProviderConfig): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(prompt, cfg)),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
  } catch (err: any) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      throw makeArkError('AI 请求超时', 'AI_TIMEOUT', null, true, true);
    }
    throw makeArkError(err?.message || 'AI 请求网络错误', 'AI_NETWORK_ERROR', null, true);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw makeArkError('AI 请求被限流', 'AI_RATE_LIMITED', 429, false);
    }
    // 尽力带出服务端错误详情（Key 无效/模型不存在/区域限制等），便于在设置页直接诊断
    let detail = '';
    try {
      const text = await response.text();
      try {
        const j = JSON.parse(text);
        detail = j?.error?.message || j?.error?.code || j?.message || '';
        if (!detail && typeof j === 'object') {
          detail = j?.error ? JSON.stringify(j.error) : '';
        }
      } catch {
        detail = text.slice(0, 300);
      }
    } catch { /* 无响应体 */ }
    const suffix = detail ? `：${String(detail).slice(0, 200)}` : '';
    throw makeArkError(`AI 请求失败: HTTP ${response.status}${suffix}`, 'AI_REQUEST_FAILED', response.status, response.status >= 500);
  }

  const data: any = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw makeArkError('AI 响应格式异常：无有效内容', 'AI_INVALID_RESPONSE', null, true);
  }
  return content;
}

/**
 * 聊天模型调用（带重试）：
 * - 400/401/403 → 不重试直接抛（配置问题）
 * - 429 → 不重试直接抛（限流，提示稍后再试）
 * - 5xx / 超时 / 网络错 → 重试 1 次
 */
export async function callArkChatAPI(prompt: string, cfg: ProviderConfig): Promise<string> {
  try {
    return await callArkAPI(prompt, cfg);
  } catch (err: any) {
    if (err.status === 429 || (err.status && err.status >= 400 && err.status < 500)) {
      throw err;
    }
    if (err.timedOut || (err.status && err.status >= 500) || err.code === 'AI_NETWORK_ERROR') {
      try {
        return await callArkAPI(prompt, cfg);
      } catch (err2: any) {
        throw err;
      }
    }
    throw err;
  }
}

/** 用配置做一次最小连通测试（不保存） */
export async function testArkConnection(cfg: ProviderConfig): Promise<{ ok: boolean; latencyMs: number; detail: string }> {
  const start = Date.now();
  try {
    const content = await callArkAPI('请只回复两个字：正常', { ...cfg, timeoutMs: Math.min(cfg.timeoutMs, 45000) });
    return { ok: true, latencyMs: Date.now() - start, detail: `模型已响应（${content.slice(0, 20)}）` };
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, detail: err?.message || '连接失败' };
  }
}

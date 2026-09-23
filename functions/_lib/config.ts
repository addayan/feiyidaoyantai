// 模型配置读取中心（V3）：聊天 / 图片 / 视频 三类模型
// KV（/admin 页面可配置）优先，环境变量兜底
// KV 存储格式：{ chat: {...}|null, image: {...}|null, video: {...}|null }
// 兼容旧格式：{ primary, fallback } 或 { apiKey, modelId, ... }（视为聊天模型）

export const CONFIG_KV_KEY = 'model-config';
export const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export interface ProviderConfig {
  apiKey: string;
  modelId: string;
  baseUrl: string;
  timeoutMs: number;
}

export interface ModelConfig {
  chat: ProviderConfig | null;
  image: ProviderConfig | null;
  video: ProviderConfig | null;
}

export type ProviderKind = 'chat' | 'image' | 'video';

export const PROVIDER_KINDS: ProviderKind[] = ['chat', 'image', 'video'];

export function isModelConfigured(cfg: ModelConfig): boolean {
  return !!(cfg.chat?.apiKey && cfg.chat.modelId);
}

export function getSafeModelId(cfg: ModelConfig): string {
  return cfg.chat?.modelId || '(未配置)';
}

function normalizeProvider(p: any): ProviderConfig | null {
  if (!p || typeof p !== 'object') return null;
  const apiKey = String(p.apiKey || '');
  const modelId = String(p.modelId || '');
  if (!apiKey && !modelId) return null;
  return {
    apiKey,
    modelId,
    baseUrl: normalizeBaseUrl(p.baseUrl || DEFAULT_BASE_URL),
    timeoutMs: typeof p.timeoutMs === 'number' && p.timeoutMs > 0 ? p.timeoutMs : 120000,
  };
}

/** 从环境变量读取（兜底，作为聊天模型） */
export function getModelConfigFromEnv(env: Record<string, string>): ModelConfig {
  return {
    chat: normalizeProvider({
      apiKey: env.ARK_API_KEY || '',
      modelId: env.ARK_MODEL_ID || '',
      baseUrl: env.ARK_BASE_URL || DEFAULT_BASE_URL,
      timeoutMs: parseInt(env.ARK_TIMEOUT_MS || '120000', 10),
    }),
    image: null,
    video: null,
  };
}

/** KV 读取：优先 KV 配置，KV 无配置/损坏时回退环境变量 */
export async function getModelConfig(context: { env: any }): Promise<ModelConfig> {
  const env = context.env as Record<string, string>;
  const kv = context.env?.ARK_CONFIG_KV as KVNamespace | undefined;

  if (kv) {
    try {
      const raw = await kv.get(CONFIG_KV_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        // 新格式 { chat, image, video }
        if (parsed.chat !== undefined || parsed.image !== undefined || parsed.video !== undefined) {
          return {
            chat: normalizeProvider(parsed.chat),
            image: normalizeProvider(parsed.image),
            video: normalizeProvider(parsed.video),
          };
        }
        // 旧格式 { primary, fallback } → chat = primary（备用模型已废弃）
        if (parsed.primary && (parsed.primary.apiKey || parsed.primary.modelId)) {
          return { chat: normalizeProvider(parsed.primary), image: null, video: null };
        }
        // 旧格式 { apiKey, modelId, ... } → 视为聊天模型
        if (parsed.apiKey || parsed.modelId) {
          return { chat: normalizeProvider(parsed), image: null, video: null };
        }
      }
    } catch {
      // KV 读取失败（如 JSON 损坏）时静默回退环境变量
    }
  }
  return getModelConfigFromEnv(env);
}

/**
 * 写入 KV 配置。
 * patch: { chat?: Partial<ProviderConfig>|null, image?: ..., video?: ... }
 * 各字段空字符串 = 保留原值；某组传 null 或全空 = 删除该组。
 * 三组全空 = 删除 KV 配置回退环境变量。
 */
export async function saveModelConfig(
  kv: KVNamespace | undefined,
  patch: Partial<Record<ProviderKind, Partial<ProviderConfig> | null>>,
): Promise<ModelConfig> {
  const current = await readRawConfig(kv);

  const merge = (base: ProviderConfig | null, p: Partial<ProviderConfig> | null | undefined): ProviderConfig | null => {
    if (!p) return base;
    const apiKey = p.apiKey === '' || p.apiKey == null ? base?.apiKey || '' : String(p.apiKey);
    const modelId = p.modelId === '' || p.modelId == null ? base?.modelId || '' : String(p.modelId);
    if (!apiKey && !modelId) return null;
    return {
      apiKey,
      modelId,
      baseUrl: p.baseUrl ? normalizeBaseUrl(String(p.baseUrl)) : base?.baseUrl || DEFAULT_BASE_URL,
      timeoutMs: typeof p.timeoutMs === 'number' && p.timeoutMs > 0 ? p.timeoutMs : base?.timeoutMs || 120000,
    };
  };

  const stored: any = {};
  for (const kind of PROVIDER_KINDS) {
    const merged = merge(current?.[kind] || null, patch[kind]);
    if (merged) stored[kind] = merged;
  }

  if (!kv) {
    throw Object.assign(new Error('当前项目未绑定 KV 存储，无法在线保存配置。请先在 Cloudflare 控制台创建 KV 并绑定到 Pages（变量名 ARK_CONFIG_KV）'), { code: 'KV_NOT_BOUND' });
  }

  if (Object.keys(stored).length === 0) {
    await kv.delete(CONFIG_KV_KEY);
    return { chat: null, image: null, video: null };
  }

  await kv.put(CONFIG_KV_KEY, JSON.stringify(stored));
  return { chat: stored.chat || null, image: stored.image || null, video: stored.video || null };
}

async function readRawConfig(kv: KVNamespace | undefined): Promise<ModelConfig | null> {
  if (!kv) return null;
  try {
    const raw = await kv.get(CONFIG_KV_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as any;
    if (parsed.chat !== undefined || parsed.image !== undefined || parsed.video !== undefined) {
      return {
        chat: normalizeProvider(parsed.chat),
        image: normalizeProvider(parsed.image),
        video: normalizeProvider(parsed.video),
      };
    }
    if (parsed.primary && (parsed.primary.apiKey || parsed.primary.modelId)) {
      return { chat: normalizeProvider(parsed.primary), image: null, video: null };
    }
    if (parsed.apiKey || parsed.modelId) {
      return { chat: normalizeProvider(parsed), image: null, video: null };
    }
  } catch { /* 忽略损坏数据 */ }
  return null;
}

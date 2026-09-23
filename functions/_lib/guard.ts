// AI 流量保护 V1（KV 实现，边缘多实例下为宽松保护）
// - 限速：每分钟配额（聊天 8 / 图片 10 / 视频 10）
// - 并发：每类最大并发 2
// - 去重：10 秒内相同请求禁止重复提交
// - 缓存：相同请求结果本地缓存（含配置指纹）
// - 用量：每日请求次数（聊天 / 图片 / 视频 分计）
// KV keys:
//   guard:rate:<model>:<epochMinute>  计数器（TTL 150s）
//   guard:conc:<model>                并发计数（TTL 90s，超时自动回收）
//   guard:dedupe:<hash>               去重标记（TTL 60s，值内时间戳实现 10s 窗口）
//   guard:cache:<fp>:<hash>           结果缓存（TTL 1h）
//   guard:usage:<date>:<model>        每日用量（无 TTL）

export type ModelName = 'chat' | 'image' | 'video';

const RATE_LIMITS: Record<ModelName, number> = { chat: 8, image: 10, video: 10 };
const MAX_CONCURRENCY: Record<ModelName, number> = { chat: 2, image: 2, video: 2 };

export type GuardResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

const LABELS: Record<ModelName, string> = { chat: '聊天', image: '图片', video: '视频' };

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

async function readNum(kv: KVNamespace, key: string): Promise<number> {
  try {
    const raw = await kv.get(key);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/** 限速检查：超过配额返回失败 */
export async function checkRateLimit(kv: KVNamespace | undefined, model: ModelName): Promise<GuardResult> {
  if (!kv) return { ok: true };
  const limit = RATE_LIMITS[model];
  const minute = Math.floor(Date.now() / 60000);
  const key = `guard:rate:${model}:${minute}`;
  const count = await readNum(kv, key);
  if (count >= limit) {
    return { ok: false, code: 'AI_RATE_LIMITED', message: `${LABELS[model]}模型触发本地限速（${limit} 次/分钟），请稍后再试` };
  }
  try {
    await kv.put(key, String(count + 1), { expirationTtl: 150 });
  } catch { /* KV 写入失败时放行，避免 AI 主流程受存储影响 */ }
  return { ok: true };
}

/**
 * 并发保护已移除（2026-09-18）：边缘多实例下为宽松保护，且每次请求 2 次 KV 写入
 * 会加速消耗 KV 免费套餐每日 put 配额（1000 次）。单用户场景限速已足够。
 */
export async function acquireConcurrency(): Promise<GuardResult> {
  return { ok: true };
}

export async function releaseConcurrency(): Promise<void> {
  return;
}

/** 10 秒去重：放行返回 true（KV 过期最小 60s，用值内时间戳实现精确 10s 窗口） */
export async function checkDedupe(kv: KVNamespace | undefined, hash: string): Promise<boolean> {
  if (!kv) return true;
  const key = `guard:dedupe:${hash}`;
  const now = Date.now();
  const hit = await kv.get(key);
  if (hit) {
    const firstTs = parseInt(hit, 10) || 0;
    if (now - firstTs < 10000) return false;
    // 超过 10s：放行并刷新窗口
    await kv.put(key, String(now), { expirationTtl: 60 });
    return true;
  }
  try {
    await kv.put(key, String(now), { expirationTtl: 60 });
  } catch { /* 去重写入失败时放行 */ }
  return true;
}

/** 结果缓存读取 */
export async function getCachedResult(kv: KVNamespace | undefined, cacheKey: string): Promise<string | null> {
  if (!kv) return null;
  try {
    return await kv.get(cacheKey);
  } catch {
    return null;
  }
}

/** 结果缓存写入（1 小时） */
export async function cacheResult(kv: KVNamespace | undefined, cacheKey: string, body: string): Promise<void> {
  if (!kv) return;
  try {
    await kv.put(cacheKey, body, { expirationTtl: 3600 });
  } catch { /* 缓存失败不影响主流程 */ }
}

/** 每日用量记录 */
export async function recordUsage(kv: KVNamespace | undefined, model: ModelName): Promise<void> {
  if (!kv) return;
  const key = `guard:usage:${today()}:${model}`;
  const count = await readNum(kv, key);
  try {
    await kv.put(key, String(count + 1));
  } catch { /* 用量记录失败不影响主流程 */ }
}

/** 读取今日用量 */
export async function readUsage(kv: KVNamespace | undefined): Promise<{ date: string; chat: number; image: number; video: number; total: number }> {
  const date = today();
  const chat = kv ? await readNum(kv, `guard:usage:${date}:chat`) : 0;
  const image = kv ? await readNum(kv, `guard:usage:${date}:image`) : 0;
  const video = kv ? await readNum(kv, `guard:usage:${date}:video`) : 0;
  return { date, chat, image, video, total: chat + image + video };
}

/** 请求哈希（生成参数 + 模型指纹，用于去重与缓存） */
export function hashRequest(payload: string, fingerprint: string): string {
  let h = 5381;
  const s = `${fingerprint}|${payload}`;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16) + '_' + s.length.toString(16);
}

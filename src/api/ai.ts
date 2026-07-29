// 支持运行时配置：优先使用 window.__API_BASE__（由 public/config.js 设置）
// 未设置时默认使用同源 /api（生产环境 Express 同时提供静态文件和 API）
declare global {
  interface Window { __API_BASE__?: string; }
}
const API_BASE = window.__API_BASE__ || '/api';
const DEFAULT_TIMEOUT = 120000;

// ==================== 类型定义 ====================

export interface AIError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  modelConfigured: boolean;
  modelId?: string;
}

export interface GenerateRequest {
  heritageType: string;
  topic: string;
  purpose: string;
  duration: string;
  style: string;
}

export interface RegenerateSectionRequest {
  project: any;
  sectionType: string;
  instruction?: string;
}

export interface RegenerateShotRequest {
  project: any;
  shotIndex: number;
  instruction?: string;
}

export interface OptimizeShotRequest {
  project: any;
  shotIndex: number;
  optimizeType: string;
  customInstruction?: string;
}

export interface OptimizePromptRequest {
  project: any;
  shotIndex: number;
  promptField: string;
  optimizeType: string;
  customInstruction?: string;
}

// ==================== 内部工具函数 ====================

/**
 * 将非 AI 错误统一转换为 AIError
 */
function toAIError(error: unknown): AIError {
  // AbortError（超时或外部取消）
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { code: 'AI_TIMEOUT', message: '请求超时或被取消', retryable: true };
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return { code: 'AI_TIMEOUT', message: '请求超时或被取消', retryable: true };
  }

  // 服务端返回的错误
  if (error instanceof Response) {
    return {
      code: `AI_SERVER_${error.status}`,
      message: `服务端错误: ${error.status} ${error.statusText}`,
      retryable: error.status >= 500,
    };
  }

  // 网络错误
  return { code: 'AI_REQUEST_FAILED', message: String(error), retryable: true };
}

/**
 * 创建带超时的 AbortController，并链接外部 signal
 * 返回 { controller, timer }，调用方须在 finally 中清除 timer
 */
function createTimeoutController(
  signal?: AbortSignal | null,
  timeoutMs: number = DEFAULT_TIMEOUT,
): { controller: AbortController; timer: ReturnType<typeof setTimeout> } {
  const controller = new AbortController();

  // 如果有外部 signal，监听其 abort 事件
  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      signal.addEventListener('abort', () => controller.abort(signal.reason), {
        once: true,
      });
    }
  }

  // 设置超时
  const timer = setTimeout(() => controller.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);

  return { controller, timer };
}

// ==================== 导出 API 函数 ====================

/**
 * 检查 AI 后端健康状态
 */
export async function checkAIHealth(signal?: AbortSignal | null): Promise<HealthResponse> {
  const { controller, timer } = createTimeoutController(signal);

  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    throw toAIError(error);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 生成分镜头脚本
 */
export async function generateStoryboard(
  req: GenerateRequest,
  signal?: AbortSignal | null,
  timeoutMs: number = DEFAULT_TIMEOUT,
): Promise<any> {
  const { controller, timer } = createTimeoutController(signal, timeoutMs);

  try {
    const response = await fetch(`${API_BASE}/generate-storyboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    throw toAIError(error);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 重新生成某个 section
 */
export async function regenerateSection(
  req: RegenerateSectionRequest,
  signal?: AbortSignal | null,
  timeoutMs: number = DEFAULT_TIMEOUT,
): Promise<any> {
  const { controller, timer } = createTimeoutController(signal, timeoutMs);

  try {
    const response = await fetch(`${API_BASE}/regenerate-section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    throw toAIError(error);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 重新生成某个 shot
 */
export async function regenerateShot(
  req: RegenerateShotRequest,
  signal?: AbortSignal | null,
  timeoutMs: number = DEFAULT_TIMEOUT,
): Promise<any> {
  const { controller, timer } = createTimeoutController(signal, timeoutMs);

  try {
    const response = await fetch(`${API_BASE}/regenerate-shot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    throw toAIError(error);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 优化某个 shot
 */
export async function optimizeShot(
  req: OptimizeShotRequest,
  signal?: AbortSignal | null,
  timeoutMs: number = DEFAULT_TIMEOUT,
): Promise<any> {
  const { controller, timer } = createTimeoutController(signal, timeoutMs);

  try {
    const response = await fetch(`${API_BASE}/optimize-shot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    throw toAIError(error);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 优化某个 prompt 字段，返回 string
 */
export async function optimizePrompt(
  req: OptimizePromptRequest,
  signal?: AbortSignal | null,
  timeoutMs: number = DEFAULT_TIMEOUT,
): Promise<string> {
  const { controller, timer } = createTimeoutController(signal, timeoutMs);

  try {
    const response = await fetch(`${API_BASE}/optimize-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw response;
    }

    return await response.text();
  } catch (error) {
    throw toAIError(error);
  } finally {
    clearTimeout(timer);
  }
}

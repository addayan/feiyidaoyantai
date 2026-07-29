// ===== 环境变量配置 =====

export const config = {
  arkApiKey: process.env.ARK_API_KEY || '',
  arkModelId: process.env.ARK_MODEL_ID || '',
  arkBaseUrl: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
  arkTimeoutMs: parseInt(process.env.ARK_TIMEOUT_MS || '120000', 10),
};

/** 模型是否已配置（API Key 和 Model ID 都存在） */
export const isModelConfigured: boolean = !!(config.arkApiKey && config.arkModelId);

/** 安全地获取模型 ID（不包含 Key） */
export function getSafeModelId(): string {
  return config.arkModelId || '(未配置)';
}

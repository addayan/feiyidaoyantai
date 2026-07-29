// ===== 后端类型定义 =====

// --- 请求类型 ---

export interface GenerateRequest {
  heritageType: string;
  topic: string;
  purpose: string;
  duration: string;
  style: string;
}

export interface RegenerateSectionRequest {
  project: any; // Project 类型，与前端一致
  sectionType: 'story' | 'characters' | 'scenes' | 'soundDesign' | 'cultureCheck' | 'submissionNote' | 'socialPosts';
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
  promptField: 'firstFramePrompt' | 'lastFramePrompt' | 'videoPrompt';
  optimizeType: string;
  customInstruction?: string;
}

// --- 错误类型 ---

export interface AIError {
  code: 'AI_NOT_CONFIGURED' | 'AI_TIMEOUT' | 'AI_RATE_LIMITED' | 'AI_INVALID_RESPONSE' | 'AI_REQUEST_FAILED' | 'AI_NORMALIZE_FAILED';
  message: string;
  retryable: boolean;
}

// --- Health 响应 ---

export interface HealthResponse {
  ok: boolean;
  service: string;
  modelConfigured: boolean;
  modelId?: string;
}

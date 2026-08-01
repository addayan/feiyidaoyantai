// 非遗影像工坊 AI 代理 Worker
// 代理硅基流动 API，安全存储 Key，绝不暴露到前端

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

function errorResponse(code, message, status = 500) {
  return jsonResponse({ error: { code, message, retryable: status >= 500 } }, status);
}

async function callSiliconFlow(prompt, env) {
  const apiKey = env.ARK_API_KEY || '';
  const modelId = env.ARK_MODEL_ID || 'deepseek-ai/DeepSeek-V2.5';
  const baseUrl = env.ARK_BASE_URL || 'https://api.siliconflow.cn/v1';
  const timeoutMs = parseInt(env.ARK_TIMEOUT_MS || '120000', 10);

  if (!apiKey) {
    throw Object.assign(new Error('AI API Key 未配置'), { code: 'AI_NOT_CONFIGURED', retryable: false });
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 16000
    }),
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw Object.assign(new Error('AI 请求被限流'), { code: 'AI_RATE_LIMITED', retryable: true });
    }
    throw Object.assign(new Error(`AI 请求失败: HTTP ${response.status}`), { code: 'AI_REQUEST_FAILED', retryable: response.status >= 500 });
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw Object.assign(new Error('AI 响应格式异常'), { code: 'AI_INVALID_RESPONSE', retryable: true });
  }
  return content;
}

// ===== Prompt 构建 =====

function buildGeneratePrompt(request) {
  const { heritageType, topic, purpose, duration, style } = request;
  return `你是一位专业的非遗影像导演与 AIGC 分镜设计师。请为以下项目生成完整的短片方案：

【项目信息】
- 非遗类型：${heritageType}
- 创作主题：${topic}
- 作品用途：${purpose}
- 视频时长：${duration}
- 视觉风格：${style}

请生成一个 JSON 对象，包含以下字段：
1. story: { title, tagline, synopsis }
2. characters: [{ name, age, identity, appearance, costume, personality, relationship, props, anchorPoint }]
3. scenes: [{ name, time, location, atmosphere, coreVisualElements, allowedElements, avoidElements, colorSuggestion, soundElements }]
4. shots: [{ scene, shotSize, camera, duration, description, composition, lighting, cameraAngle, depthOfField, speed, mood, transition, firstFramePrompt, lastFramePrompt, videoPrompt, generatabilityScore, generatabilityChecks }]
5. soundDesign: { bgm, ambientSound, voice, soundEffects }
6. cultureCheck: { overallScore, items, notes, suggestions }
7. submissionNote: { title, introduction, creativeNote, techNote, aiUsageNote, culturalValue, suitableTrack, specSuggestion }
8. socialPosts: { douyin, xiaohongshu }

注意：
- 所有内容必须中文
- shots 数量根据时长确定（30秒约6-8个镜头，1分钟约10-12个，3分钟约20-25个，5分钟约30-35个）
- 每个 shot 的 firstFramePrompt 和 lastFramePrompt 必须是英文 AI 绘画提示词
- videoPrompt 必须是英文 AI 视频生成提示词
- generatabilityScore 是 0-100 的可生成性评分
- 只返回 JSON，不要 markdown 代码块`;
}

function buildRegenerateSectionPrompt(request, section) {
  const { heritageType, topic, purpose, duration, style } = request;
  return `你是一位专业的非遗影像导演。请为以下项目重新生成【${section}】部分：

【项目信息】
- 非遗类型：${heritageType}
- 创作主题：${topic}
- 作品用途：${purpose}
- 视频时长：${duration}
- 视觉风格：${style}

请只返回【${section}】部分的 JSON 数据，格式与之前一致。只返回 JSON，不要 markdown 代码块。`;
}

function buildRegenerateShotPrompt(request, scene, shotSize, camera) {
  const { heritageType, style } = request;
  return `你是一位专业的非遗影像导演。请为以下场景生成一个新的镜头：

【项目信息】
- 非遗类型：${heritageType}
- 视觉风格：${style}
- 场景：${scene}
- 景别：${shotSize}
- 运镜：${camera}

请返回一个 shot 对象的 JSON，包含：scene, shotSize, camera, duration, description, composition, lighting, cameraAngle, depthOfField, speed, mood, transition, firstFramePrompt, lastFramePrompt, videoPrompt, generatabilityScore, generatabilityChecks。只返回 JSON，不要 markdown 代码块。`;
}

function buildOptimizeShotPrompt(shot, type) {
  return `你是一位专业的 AIGC 提示词工程师。请优化以下镜头的提示词，优化方向：${type}

【原始镜头信息】
${JSON.stringify(shot, null, 2)}

请返回优化后的 shot 对象 JSON，包含改进后的 firstFramePrompt, lastFramePrompt, videoPrompt。只返回 JSON，不要 markdown 代码块。`;
}

function buildOptimizePromptPrompt(prompt, type) {
  return `你是一位专业的 AIGC 提示词工程师。请优化以下提示词，优化方向：${type}

【原始提示词】
${prompt}

请返回优化后的提示词字符串。只返回字符串，不要 markdown 代码块。`;
}

// ===== 安全 JSON 解析 =====

function safeJSONParse(text) {
  try {
    const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    return { data: JSON.parse(cleaned), error: null };
  } catch (e) {
    try {
      return { data: JSON.parse(text), error: null };
    } catch (e2) {
      return { data: null, error: e2.message };
    }
  }
}

// ===== 数据规范化 =====

function fillMissingShotDetails(shot, index, totalShots) {
  if (!shot.composition) {
    const sizeToComposition = {
      '特写': '中心构图', '近景': '中心构图',
      '中景': '三分法', '中近景': '三分法',
      '全景': '层次构图', '远景': '引导线构图', '大远景': '黄金分割'
    };
    shot.composition = sizeToComposition[shot.shotSize] || '三分法';
  }
  if (!shot.lighting) {
    const desc = String(shot.description || '');
    if (/黄昏|夕阳|暖光|温暖/.test(desc)) shot.lighting = '暖光';
    else if (/逆光|剪影|轮廓/.test(desc)) shot.lighting = '逆光';
    else if (/室内|工坊|屋内/.test(desc)) shot.lighting = '柔光';
    else if (/室外|户外|自然/.test(desc)) shot.lighting = '自然光';
    else if (/冷|蓝|夜/.test(desc)) shot.lighting = '冷光';
    else shot.lighting = '柔光';
  }
  if (!shot.cameraAngle) {
    const cameraToAngle = { '航拍': '鸟瞰', '手持': '平视' };
    shot.cameraAngle = cameraToAngle[shot.camera] || '平视';
  }
  if (!shot.depthOfField) {
    shot.depthOfField = shot.shotSize === '特写' || shot.shotSize === '近景' ? '浅景深' : '深景深';
  }
  if (!shot.speed) shot.speed = '正常速度';
  if (!shot.mood) {
    const desc = String(shot.description || '');
    if (/庄重|仪式|传统/.test(desc)) shot.mood = '庄重';
    else if (/温馨|温暖|亲情/.test(desc)) shot.mood = '温馨';
    else if (/紧张|冲突|危机/.test(desc)) shot.mood = '紧张';
    else if (/神秘|古老|传说/.test(desc)) shot.mood = '神秘';
    else shot.mood = '平和';
  }
  if (!shot.transition) {
    shot.transition = index === 0 ? '淡入淡出' : '硬切';
  }
}

function normalizeGeneratedResult(parsed, request) {
  if (!parsed) return null;

  if (parsed.shots && Array.isArray(parsed.shots)) {
    parsed.shots.forEach((shot, index) => {
      fillMissingShotDetails(shot, index, parsed.shots.length);
    });
  }

  return {
    title: parsed.story?.title || `${request.heritageType} - ${request.topic}`,
    tagline: parsed.story?.tagline || '',
    heritageType: request.heritageType,
    purpose: request.purpose,
    duration: request.duration,
    style: request.style,
    story: parsed.story || { title: '', tagline: '', synopsis: '' },
    characters: parsed.characters || [],
    scenes: parsed.scenes || [],
    shots: parsed.shots || [],
    soundDesign: parsed.soundDesign || { bgm: '', ambientSound: '', voice: '', soundEffects: '' },
    cultureCheck: parsed.cultureCheck || { overallScore: 0, items: [], notes: '', suggestions: '' },
    submissionNote: parsed.submissionNote || { title: '', introduction: '', creativeNote: '', techNote: '', aiUsageNote: '', culturalValue: '', suitableTrack: '', specSuggestion: '' },
    socialPosts: parsed.socialPosts || { douyin: '', xiaohongshu: '' }
  };
}

// ===== 路由处理 =====

async function handleHealth(env) {
  const apiKey = env.ARK_API_KEY || '';
  const modelId = env.ARK_MODEL_ID || 'deepseek-ai/DeepSeek-V2.5';
  return jsonResponse({
    ok: true,
    service: '非遗影像工坊 AI 代理',
    modelConfigured: !!(apiKey && modelId),
    modelId: modelId || '(未配置)',
    baseUrl: env.ARK_BASE_URL || 'https://api.siliconflow.cn/v1'
  });
}

async function handleGenerateStoryboard(request, env) {
  const body = await request.json();
  const { heritageType, topic, purpose, duration, style } = body;
  if (!heritageType || !topic || !purpose || !duration || !style) {
    return errorResponse('AI_REQUEST_FAILED', '缺少必要参数', 400);
  }

  const prompt = buildGeneratePrompt({ heritageType, topic, purpose, duration, style });
  const rawText = await callSiliconFlow(prompt, env);
  const { data: parsed, error: parseError } = safeJSONParse(rawText);
  if (!parsed) {
    return errorResponse('AI_INVALID_RESPONSE', `AI 返回内容无法解析: ${parseError}`, 500);
  }

  const normalized = normalizeGeneratedResult(parsed, { heritageType, topic, purpose, duration, style });
  return jsonResponse(normalized);
}

async function handleRegenerateSection(request, env) {
  const body = await request.json();
  const { heritageType, topic, purpose, duration, style, section } = body;
  if (!section) {
    return errorResponse('AI_REQUEST_FAILED', '缺少 section 参数', 400);
  }

  const prompt = buildRegenerateSectionPrompt({ heritageType, topic, purpose, duration, style }, section);
  const rawText = await callSiliconFlow(prompt, env);
  const { data: parsed, error: parseError } = safeJSONParse(rawText);
  if (!parsed) {
    return errorResponse('AI_INVALID_RESPONSE', `AI 返回内容无法解析: ${parseError}`, 500);
  }

  return jsonResponse(parsed);
}

async function handleRegenerateShot(request, env) {
  const body = await request.json();
  const { heritageType, style, scene, shotSize, camera } = body;

  const prompt = buildRegenerateShotPrompt({ heritageType, style }, scene, shotSize, camera);
  const rawText = await callSiliconFlow(prompt, env);
  const { data: parsed, error: parseError } = safeJSONParse(rawText);
  if (!parsed) {
    return errorResponse('AI_INVALID_RESPONSE', `AI 返回内容无法解析: ${parseError}`, 500);
  }

  fillMissingShotDetails(parsed, 0, 1);
  return jsonResponse(parsed);
}

async function handleOptimizeShot(request, env) {
  const body = await request.json();
  const { shot, type } = body;
  if (!shot || !type) {
    return errorResponse('AI_REQUEST_FAILED', '缺少必要参数', 400);
  }

  const prompt = buildOptimizeShotPrompt(shot, type);
  const rawText = await callSiliconFlow(prompt, env);
  const { data: parsed, error: parseError } = safeJSONParse(rawText);
  if (!parsed) {
    return errorResponse('AI_INVALID_RESPONSE', `AI 返回内容无法解析: ${parseError}`, 500);
  }

  return jsonResponse(parsed);
}

async function handleOptimizePrompt(request, env) {
  const body = await request.json();
  const { prompt, type } = body;
  if (!prompt || !type) {
    return errorResponse('AI_REQUEST_FAILED', '缺少必要参数', 400);
  }

  const aiPrompt = buildOptimizePromptPrompt(prompt, type);
  const rawText = await callSiliconFlow(aiPrompt, env);
  return jsonResponse({ optimizedPrompt: rawText.trim() });
}

// ===== Worker 入口 =====

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      if (pathname === '/api/health') {
        return await handleHealth(env);
      }
      if (pathname === '/api/generate-storyboard' && request.method === 'POST') {
        return await handleGenerateStoryboard(request, env);
      }
      if (pathname === '/api/regenerate-section' && request.method === 'POST') {
        return await handleRegenerateSection(request, env);
      }
      if (pathname === '/api/regenerate-shot' && request.method === 'POST') {
        return await handleRegenerateShot(request, env);
      }
      if (pathname === '/api/optimize-shot' && request.method === 'POST') {
        return await handleOptimizeShot(request, env);
      }
      if (pathname === '/api/optimize-prompt' && request.method === 'POST') {
        return await handleOptimizePrompt(request, env);
      }

      return errorResponse('NOT_FOUND', '接口不存在', 404);
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        return errorResponse('AI_TIMEOUT', 'AI 请求超时', 504);
      }
      const code = err.code || 'AI_REQUEST_FAILED';
      const status = err.code === 'AI_NOT_CONFIGURED' ? 503 : 500;
      return errorResponse(code, err.message || '未知错误', status);
    }
  }
};

// ===== 分镜方案生成 Prompt =====
const JSON_SCHEMA_TEMPLATE = `{
  "title": "作品标题",
  "tagline": "一句话宣传语",
  "story": {
    "title": "故事标题（可同作品标题）",
    "tagline": "故事一句话",
    "synopsis": "200-400字故事梗概"
  },
  "characters": [
    {
      "name": "角色名",
      "age": "年龄",
      "identity": "身份（如：蜀绣老艺人、大学生）",
      "appearance": "外貌描写",
      "costume": "服装/服饰描写",
      "personality": "性格特点",
      "relationship": "与其他角色关系",
      "props": "标志性道具",
      "anchorPoint": "一致性锚点（用于 AI 生成的稳定描述）"
    }
  ],
  "scenes": [
    {
      "name": "场景名称",
      "time": "时间（如：黄昏、白天）",
      "location": "地点",
      "atmosphere": "氛围描述",
      "coreVisualElements": "核心视觉元素",
      "allowedElements": "允许出现的元素",
      "avoidElements": "必须避免的元素",
      "colorSuggestion": "色彩建议",
      "soundElements": "声音元素"
    }
  ],
  "shots": [
    {
      "id": "shot-1",
      "scene": "所属场景名称",
      "shotSize": "景别（特写/近景/中景/中近景/全景/远景/大远景）",
      "camera": "运镜（固定/推/拉/摇/移/跟/升/降/环绕/推摇/拉摇/跟移/航拍/手持）",
      "duration": "时长（如：5秒）",
      "description": "镜头内容描述（30-80字）",
      "firstFramePrompt": "首帧画面提示词（适合 AI 图像生成，100-200字英文/中文混合，描述画面构图、人物、光影、色彩、风格）",
      "lastFramePrompt": "尾帧画面提示词（适合 AI 图像生成，描述镜头结束时的画面，需与首帧有连贯性）",
      "videoPrompt": "视频生成提示词（适合 AI 视频生成，描述运镜、动态、时间变化，200-300字）",
      "generatabilityScore": 85,
      "generatabilityChecks": [
        { "label": "主体明确", "status": "pass", "detail": "主体清晰可辨" },
        { "label": "场景清晰", "status": "pass", "detail": "场景描述具体" },
        { "label": "运镜合理", "status": "pass", "detail": "运镜方式可实现" },
        { "label": "环境动态", "status": "pass", "detail": "环境动态描述充分" }
      ]
    }
  ],
  "soundDesign": {
    "bgm": "背景音乐设计",
    "ambientSound": "环境音设计",
    "voice": "旁白/对白设计",
    "soundEffects": "音效设计"
  },
  "cultureCheck": {
    "overallScore": 85,
    "items": [
      { "label": "文化符号使用", "status": "正常", "detail": "..." },
      { "label": "猎奇化风险", "status": "低", "detail": "..." },
      { "label": "虚构身份说明", "status": "已说明", "detail": "..." },
      { "label": "真实资料引用", "status": "建议注明来源", "detail": "..." },
      { "label": "工艺准确性", "status": "良好", "detail": "..." },
      { "label": "地域文化表达", "status": "良好", "detail": "..." }
    ],
    "notes": "文化表达说明",
    "suggestions": "优化建议",
    "disclaimer": "免责声明"
  },
  "submissionNote": {
    "title": "参赛作品标题",
    "introduction": "作品简介（100-200字）",
    "creativeNote": "创意说明（100-200字）",
    "techNote": "技术说明（100-200字）",
    "aiUsageNote": "AI 使用说明（100-200字）",
    "culturalValue": "文化价值阐述（100-200字）",
    "suitableTrack": "建议参赛赛道",
    "specSuggestion": "规格建议"
  },
  "socialPosts": {
    "douyin": "抖音发布文案（含话题标签，200字以内）",
    "xiaohongshu": "小红书发布文案（含话题标签和表情，200字以内）"
  }
}`;
/**
 * 构建完整的分镜方案生成 prompt。
 */
export function buildGeneratePrompt(request, safetyRules) {
    return `你是一位专业的非遗影像创作策划师。请根据以下要求，为一个关于"${request.heritageType}"的 AI 短片创作完整的分镜方案。

## 创作参数
- 非遗类型：${request.heritageType}
- 创作主题：${request.topic}
- 作品用途：${request.purpose}
- 视频时长：${request.duration}
- 视觉风格：${request.style}

## 输出要求

### 格式要求（极其重要）
1. 只返回纯 JSON，不要返回任何 Markdown 格式。
2. 不要使用代码围栏（不要用 \`\`\`json）。
3. 不要在 JSON 前后添加任何解释文字。
4. JSON 必须是合法的、可直接解析的。

### 内容要求
1. **镜头数量**：严格生成 8 个镜头（shots 数组长度必须为 8）。
2. **总时长**：8 个镜头的时长之和应与用户选择的"${request.duration}"匹配。
3. **每个镜头**必须包含完整的 id、scene、shotSize、camera、duration、description、firstFramePrompt、lastFramePrompt、videoPrompt、generatabilityScore、generatabilityChecks。
4. **提示词质量**：
   - firstFramePrompt 和 lastFramePrompt 必须适合真实的 AI 图像生成（Seedream/SDXL/Midjourney），需描述构图、光影、色彩、人物姿态、细节纹理。
   - videoPrompt 必须适合真实的 AI 视频生成（Seedance/Kling/Sora），需描述运镜、动态变化、时间流逝。
   - 提示词可混合中英文，但画面描述部分建议用英文或中英混合以提高 AI 生成质量。
5. **文化表达检查**（cultureCheck）必须完整，包含 overallScore、items 数组、notes、suggestions、disclaimer。
6. **参赛说明**（submissionNote）必须包含全部 8 个字段。
7. **发布文案**（socialPosts）必须包含 douyin 和 xiaohongshu 两个平台文案。

### 人物设定
- 角色为虚构创作角色，使用"非遗老艺人""手艺师傅"等泛称，不得虚构为国家级或省级传承人。

## JSON 输出模板

请严格按照以下结构输出 JSON（shots 数组请填入 8 个完整镜头）：

${JSON_SCHEMA_TEMPLATE}

## 安全规则

${safetyRules}

再次强调：只返回纯 JSON，不使用代码围栏，不添加任何解释文字。`;
}

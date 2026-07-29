// ===== 重新生成模块 Prompt =====

/**
 * 根据模块类型构建重新生成 prompt。
 */
export function buildRegenerateSectionPrompt(
  project: any,
  sectionType: string,
  safetyRules: string,
  instruction?: string,
): string {
  const data = project.data || project;

  const sectionDescriptions: Record<string, string> = {
    story: `创意与故事（story）：包含 title、tagline、synopsis 三个字段。`,
    characters: `角色设定（characters）：角色数组，每个角色包含 name、age、identity、appearance、costume、personality、relationship、props、anchorPoint。`,
    scenes: `场景设定（scenes）：场景数组，每个场景包含 name、time、location、atmosphere、coreVisualElements、allowedElements、avoidElements、colorSuggestion、soundElements。`,
    soundDesign: `声音设计（soundDesign）：包含 bgm、ambientSound、voice、soundEffects 四个字段。`,
    cultureCheck: `文化表达检查（cultureCheck）：包含 overallScore、items 数组、notes、suggestions、disclaimer。`,
    submissionNote: `参赛说明（submissionNote）：包含 title、introduction、creativeNote、techNote、aiUsageNote、culturalValue、suitableTrack、specSuggestion 八个字段。`,
    socialPosts: `发布文案（socialPosts）：包含 douyin 和 xiaohongshu 两个平台文案。`,
  };

  const sectionTemplate: Record<string, string> = {
    story: `{
  "title": "故事标题",
  "tagline": "故事一句话",
  "synopsis": "200-400字故事梗概"
}`,
    characters: `[
  {
    "name": "角色名",
    "age": "年龄",
    "identity": "身份",
    "appearance": "外貌描写",
    "costume": "服装描写",
    "personality": "性格特点",
    "relationship": "与其他角色关系",
    "props": "标志性道具",
    "anchorPoint": "一致性锚点"
  }
]`,
    scenes: `[
  {
    "name": "场景名称",
    "time": "时间",
    "location": "地点",
    "atmosphere": "氛围描述",
    "coreVisualElements": "核心视觉元素",
    "allowedElements": "允许出现的元素",
    "avoidElements": "必须避免的元素",
    "colorSuggestion": "色彩建议",
    "soundElements": "声音元素"
  }
]`,
    soundDesign: `{
  "bgm": "背景音乐设计",
  "ambientSound": "环境音设计",
  "voice": "旁白/对白设计",
  "soundEffects": "音效设计"
}`,
    cultureCheck: `{
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
}`,
    submissionNote: `{
  "title": "参赛作品标题",
  "introduction": "作品简介",
  "creativeNote": "创意说明",
  "techNote": "技术说明",
  "aiUsageNote": "AI 使用说明",
  "culturalValue": "文化价值阐述",
  "suitableTrack": "建议参赛赛道",
  "specSuggestion": "规格建议"
}`,
    socialPosts: `{
  "douyin": "抖音发布文案",
  "xiaohongshu": "小红书发布文案"
}`,
  };

  // 当前模块内容（用于参考）
  const currentContent = JSON.stringify(data[sectionType] || '（当前为空）', null, 2);

  return `你是一位专业的非遗影像创作策划师。请重新生成项目"${data.title || '未命名'}"中的"${sectionDescriptions[sectionType] || sectionType}"模块。

## 项目信息
- 非遗类型：${data.heritageType}
- 视觉风格：${data.style}
- 当前主题：${data.story?.synopsis?.substring(0, 100) || data.tagline || '未知'}

## 当前模块内容
${currentContent}

${instruction ? `## 用户修改要求\n${instruction}\n` : ''}

## 输出要求
1. 只返回纯 JSON，不要返回任何 Markdown 格式或代码围栏。
2. 不要在 JSON 前后添加任何解释文字。
3. 按照以下模板结构输出：

${sectionTemplate[sectionType] || '{}'}

## 安全规则
${safetyRules}

再次强调：只返回目标模块的 JSON，不使用代码围栏，不添加解释文字。`;
}

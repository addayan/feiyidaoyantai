// ===== 镜头优化 Prompt =====
const OPTIMIZE_TYPE_LABELS = {
    cinematic: '增强电影感',
    emotion: '增强情绪表达',
    camera: '增强运镜设计',
    heritage: '增强非遗文化表达',
    generatability: '增强 AI 视频可生成性',
    simplify: '简化提示词',
    seedream: '适配 Seedream（图像生成模型）',
    seedance: '适配 Seedance（视频生成模型）',
    custom: '自定义要求',
};
const OPTIMIZE_TYPE_TIPS = {
    cinematic: '增加光影层次描述、景深效果、镜头语言、色彩情绪、电影构图参考。提示词中可加入"cinematic lighting""shallow depth of field""film grain"等电影术语。',
    emotion: '强化情绪氛围描写，增加人物表情、肢体语言、环境氛围的细节描述。使画面传达更明确的情感。',
    camera: '优化运镜描述，使运镜更具叙事性。可增加运镜速度、轨迹的描述，确保运镜在 AI 视频生成中可实现。',
    heritage: '深入描写非遗技艺的细节：工具纹理、材料质感、工序动作、传统纹样等。使文化元素更加突出和准确。',
    generatability: '简化镜头内容到 AI 可生成的范围：减少人物数量（1-2人最佳）、简化动作、保持环境一致、避免冲突动作、控制提示词长度在 200-400 字。',
    simplify: '精简提示词到最核心的元素，去除冗余描述。保留主体、场景、光影、风格等关键词，控制在 150 字以内。',
    seedream: '优化为 Seedream 图像生成模型的最佳格式：强调画面构图、主体描述、光影效果、色彩方案。使用 Seedream 推荐的提示词结构：主体 + 环境 + 光影 + 风格 + 质量。',
    seedance: '优化为 Seedance 视频生成模型的最佳格式：强调动态变化、运镜描述、时间流逝。使用 Seedance 推荐的提示词结构：场景 + 主体动作 + 运镜 + 时长 + 风格。',
    custom: '按照用户自定义要求进行优化。',
};
/**
 * 构建镜头优化 prompt。
 */
export function buildOptimizeShotPrompt(project, shotIndex, optimizeType, customInstruction) {
    const data = project.data || project;
    const shots = data.shots || [];
    const shot = shots[shotIndex];
    const label = OPTIMIZE_TYPE_LABELS[optimizeType] || optimizeType;
    const tips = OPTIMIZE_TYPE_TIPS[optimizeType] || '';
    return `你是一位专业的 AI 视频提示词优化师。请对以下镜头进行"${label}"优化。

## 项目信息
- 非遗类型：${data.heritageType}
- 视觉风格：${data.style}

## 当前镜头（镜头 ${shotIndex + 1}）
${shot ? JSON.stringify(shot, null, 2) : '（当前为空）'}

## 优化方向：${label}
${tips}
${customInstruction ? `\n## 用户自定义要求\n${customInstruction}\n` : ''}

## 输出要求
1. 只返回一个完整的镜头 JSON 对象，不要返回数组。
2. 不要使用 Markdown 代码围栏，不添加任何解释文字。
3. 优化后的镜头需保持与原镜头相同的 id、scene、shotSize。
4. 按照以下模板输出：

{
  "id": "shot-${shotIndex + 1}",
  "scene": "${shot?.scene || '场景'}",
  "shotSize": "${shot?.shotSize || '中景'}",
  "camera": "优化后的运镜",
  "duration": "${shot?.duration || '5秒'}",
  "description": "优化后的镜头描述",
  "firstFramePrompt": "优化后的首帧提示词",
  "lastFramePrompt": "优化后的尾帧提示词",
  "videoPrompt": "优化后的视频提示词",
  "generatabilityScore": 85,
  "generatabilityChecks": [
    { "label": "主体明确", "status": "pass", "detail": "..." },
    { "label": "场景清晰", "status": "pass", "detail": "..." },
    { "label": "运镜合理", "status": "pass", "detail": "..." },
    { "label": "环境动态", "status": "pass", "detail": "..." }
  ]
}

再次强调：只返回一个镜头的纯 JSON。`;
}
